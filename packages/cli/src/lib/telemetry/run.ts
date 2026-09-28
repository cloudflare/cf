import { CliExit } from "../cli-exit.js";
import { getTelemetryDispatcher } from "./dispatcher.js";
import { sanitizeError } from "./error-sanitization.js";
import { markCommandReported } from "./lifecycle.js";
import { sanitizeArgs } from "./sanitization.js";
import type { ArgClassification } from "./sanitization.js";
import type { CommandOutcome } from "./types.js";
import type { CommandModule } from "yargs";

interface CommandTelemetryMetaBase {
	command: string;
	sendMetrics?: boolean;
	/** Explicitly report a search query on the finished event. */
	searchQuery?: string;
}

export type CommandTelemetryMeta<Args = Record<string, unknown>> =
	| (CommandTelemetryMetaBase & {
			/** Disable generic argument reporting; an explicit search query can still be reported. */
			recordArgs: false;
			/** Argument classification does not apply when argument reporting is disabled. */
			classification?: never;
	  })
	| (CommandTelemetryMetaBase & {
			/** Report argument names, combinations, and sanitized values. Defaults to true. */
			recordArgs?: true;
			/**
			 * Defines which flag values are safe to report and maps short flags to their
			 * canonical names. Values for flags not listed in `safeFlags` are redacted.
			 */
			classification: ArgClassification<Args>;
	  });

const CANCELLATION_SIGNALS = new Set(["SIGINT", "SIGTERM"]);
const MAX_SEARCH_QUERY_LENGTH = 1024;

function getCliExitOutcome(error: unknown): CommandOutcome | undefined {
	// Checking the real class means a project-thrown lookalike cannot spoof an
	// outcome.
	if (!(error instanceof CliExit)) {
		return undefined;
	}
	if (error.cancelled) {
		return "cancelled";
	}
	if (error.signal && CANCELLATION_SIGNALS.has(error.signal)) {
		return "cancelled";
	}
	return error.code === 0 ? "success" : "error";
}

export async function runWithTelemetry<T, Args>(
	meta: CommandTelemetryMeta<Args>,
	argv: Record<string, unknown>,
	fn: () => T | Promise<T>
): Promise<T> {
	let dispatcher: ReturnType<typeof getTelemetryDispatcher>;
	try {
		dispatcher = getTelemetryDispatcher();
	} catch {
		// Telemetry must not prevent the command from running, if something
		// went wrong in getting the telemetry dispatcher (e.g. failing to read
		// from the filesystem) then we at least run the command without telemetry.
		return fn();
	}
	markCommandReported();

	if (meta.sendMetrics === false || !dispatcher.enabled) {
		return fn();
	}

	const base =
		meta.recordArgs === false
			? { sanitizedArgs: {}, argsUsed: [], argsCombination: "" }
			: sanitizeArgs(
					argv,
					process.argv.slice(2),
					meta.classification as ArgClassification<Record<string, unknown>>
				);
	const commandProperties = { ...base, command: meta.command };
	dispatcher.sendCommandEvent("cf command started", commandProperties);
	const searchProperties =
		meta.searchQuery === undefined
			? {}
			: {
					searchQuery: meta.searchQuery.slice(0, MAX_SEARCH_QUERY_LENGTH),
					...(meta.searchQuery.length > MAX_SEARCH_QUERY_LENGTH
						? { searchQueryTruncated: true }
						: {}),
				};

	const startedAt = Date.now();
	try {
		const result = await fn();
		dispatcher.sendCommandEvent("cf command finished", {
			...commandProperties,
			...searchProperties,
			outcome: "success",
			durationMs: Date.now() - startedAt,
		});
		return result;
	} catch (error) {
		const outcome = getCliExitOutcome(error) ?? "error";
		dispatcher.sendCommandEvent("cf command finished", {
			...commandProperties,
			...searchProperties,
			outcome,
			durationMs: Date.now() - startedAt,
			...(outcome === "error" ? sanitizeError(error) : {}),
		});
		throw error;
	}
}

export function withTelemetry<T, U>(
	command: CommandModule<T, U>,
	meta: CommandTelemetryMeta<U>
): CommandModule<T, U> {
	return {
		...command,
		handler: (argv) =>
			runWithTelemetry(meta, argv as Record<string, unknown>, () =>
				command.handler(argv)
			),
	};
}
