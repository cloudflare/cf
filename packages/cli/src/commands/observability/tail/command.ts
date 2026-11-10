import { getCloudflareApiBaseUrl } from "@cloudflare/workers-utils/compliance";
import { shortcutFilters } from "./filters.js";
import { runLiveTail } from "./stream.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { Argv, CommandModule } from "yargs";
import {
	createCommandClient,
	getAccountId,
	getComplianceRegion,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { parseObjectArray } from "#lib/body-parser.js";
import { CliExit } from "#lib/cli-exit.js";
import { formatDryRun } from "#lib/dry-run.js";
import { log } from "#lib/ui/log.js";
import prepare from "#operations/o11y/telemetry/live-tail.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 observability tail [options]\n\nStream sampled observability events across the account."
		)
		.option("worker", {
			type: "string",
			requiresArg: true,
			description:
				"Deployed Worker script name (including any environment suffix)",
		})
		.option("filters", {
			type: "string",
			requiresArg: true,
			description:
				'Telemetry filters as a JSON array or @path/to/file.json. Shape: [{key: string, type: "string" | "number" | "boolean", operation: string, value?: string | number | boolean} | {kind: "group", filterCombination: "and" | "or", filters: [...]}].',
		})
		.option("status", {
			type: "string",
			array: true,
			requiresArg: true,
			choices: ["ok", "error", "canceled"] as const,
			description: "Match events by Worker outcome",
		})
		.option("method", {
			type: "string",
			array: true,
			requiresArg: true,
			description: "Match events by HTTP trigger method",
		})
		.option("search", {
			type: "string",
			requiresArg: true,
			description: "Match text in event messages",
		})
		.option("version-id", {
			type: "string",
			requiresArg: true,
			description: "Match events by Worker version ID",
		})
		.option("filter-combination", {
			type: "string",
			choices: ["and", "or"] as const,
			default: "and" as const,
			description: "Combine telemetry filters with and/or",
		})
		.option("dry-run", {
			type: "boolean",
			default: false,
			description: "Preview the live tail request",
		})
		.example("cf observability tail", "Stream account events")
		.example(
			'cf observability tail --worker my-worker --status error --search "request failed"',
			"Filter a Worker's events"
		)
		.example(
			`cf observability tail --filters '[{"key":"$metadata.level","type":"string","operation":"eq","value":"error"}]'`,
			"Match a telemetry field"
		)
		.example(
			"cf observability tail --filters @filters.json --filter-combination or",
			"Read an array of conditions or groups from a file"
		)
		.epilogue(
			"Output is newline-delimited JSON. Workers logs must be enabled for their events to appear.\n\n" +
				"Filters and shortcuts are combined with --filter-combination (default: and). Groups can nest up to four levels. String comparisons are case-sensitive.\n\n" +
				"Filter operations: eq, neq, gt, gte, lt, lte, includes, not_includes, starts_with, ends_with, regex, in, not_in, exists, is_null. Use a comma-separated string for in/not_in; omit value for exists/is_null.\n\n" +
				"Use cf o11y telemetry keys and cf o11y telemetry values to discover fields and values."
		);
}

type Args = InferArgs<typeof builder>;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "tail",
	describe: "Stream observability events",
	builder,
	handler: async (argv) => {
		if (argv.local) {
			throw new Error("--local is not supported by cf observability tail.");
		}
		if (argv.worker !== undefined && !argv.worker.trim()) {
			throw new Error("Worker name must not be empty.");
		}
		const body = {
			...(argv.worker === undefined ? {} : { scriptId: argv.worker }),
			filters: [
				...(parseObjectArray(argv.filters, "filters") ?? []),
				...shortcutFilters(argv),
			],
			filterCombination: argv.filterCombination,
		};
		if (argv.dryRun) {
			const accountId = (await resolveAccountIdSilent()) ?? "<account-id>";
			const baseUrl = getCloudflareApiBaseUrl({
				compliance_region: await getComplianceRegion(),
			}).replace(/\/+$/, "");
			formatDryRun({
				command: "cf observability tail",
				method: prepare.method,
				url: `${baseUrl}${prepare.path({ account_id: accountId })}`,
				pathParams: {},
				bodyKind: "json",
				body,
			});
			return;
		}

		const client = await createCommandClient(argv);
		const accountId = await getAccountId();
		const controller = new AbortController();
		let interrupted: NodeJS.Signals | undefined;
		const stop = (signal: NodeJS.Signals) => {
			interrupted = signal;
			controller.abort();
		};
		const onInterrupt = () => stop("SIGINT");
		const onTerminate = () => stop("SIGTERM");
		process.on("SIGINT", onInterrupt);
		process.on("SIGTERM", onTerminate);
		try {
			await runLiveTail({
				client,
				accountId,
				body,
				signal: controller.signal,
				notice: (message) => log.info(message),
				warn: (message) => log.warn(message),
			});
		} finally {
			process.off("SIGINT", onInterrupt);
			process.off("SIGTERM", onTerminate);
		}
		if (interrupted) {
			throw new CliExit(interrupted === "SIGINT" ? 130 : 143, {
				signal: interrupted,
			});
		}
	},
};

export default command;
