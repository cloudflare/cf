import { getCloudflareApiBaseUrl } from "@cloudflare/workers-utils/compliance";
import { scopeTailFilters, tailFilters, zoneFilter } from "./filters.js";
import { filtersDescription } from "./meta.js";
import { runLiveTail } from "./stream.js";
import type { Client } from "#api";
import type { CommandClientArgs } from "#lib/auth.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { Argv, CommandModule } from "yargs";
import { prepareLiveTail } from "#lib/api-operations.js";
import {
	createCommandClient,
	getAccountId,
	getComplianceRegion,
	getZoneId,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { CliExit } from "#lib/cli-exit.js";
import { formatDryRun } from "#lib/dry-run.js";
import { isId, isValidDomainName } from "#lib/resolve.js";
import { log } from "#lib/ui/log.js";
import getWorker from "#operations/workers/get.js";
import getZone from "#operations/zones/get.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 observability tail [options]\n\nStream live observability events. Select --all, --worker, --zone, or --filters."
		)
		.option("all", {
			type: "boolean",
			description: "Stream all observability events",
		})
		.option("worker", {
			type: "string",
			requiresArg: true,
			description: "Deployed Worker script name",
			coerce: (worker: unknown) => {
				if (typeof worker !== "string" || !worker.trim()) {
					throw new Error("Use a single, non-empty Worker name.");
				}
				return worker;
			},
		})
		.option("filters", {
			type: "string",
			requiresArg: true,
			description: filtersDescription,
		})
		.option("dry-run", {
			type: "boolean",
			default: false,
			description: "Preview the live tail request",
		})
		.conflicts("all", "filters")
		.check((argv) => {
			if (
				argv.dryRun &&
				argv.zone !== undefined &&
				!isValidDomainName(argv.zone)
			) {
				throw new Error("Use a zone domain name with --zone for --dry-run.");
			}
			if (
				!argv.all &&
				argv.worker === undefined &&
				argv.zone === undefined &&
				argv.filters === undefined
			) {
				throw new Error(
					"Select events with --all, --worker <name>, --zone <id-or-domain>, or --filters <json|@file>."
				);
			}
			if (
				[
					argv.all === true,
					argv.worker !== undefined,
					argv.zone !== undefined,
				].filter(Boolean).length > 1
			) {
				throw new Error(
					"Choose one scope: --all, --worker, or --zone. Use --filters with --worker or --zone to narrow its events."
				);
			}
			return true;
		})
		.example("cf observability tail --all", "Stream all observability events")
		.example(
			`cf observability tail --filters '{"filterCombination":"and","filters":[{"key":"$metadata.level","type":"string","operation":"eq","value":"error"}]}'`,
			"Match errors"
		)
		.example(
			`cf observability tail --filters '{"filterCombination":"and","filters":[{"key":"$metadata.level","type":"string","operation":"eq","value":"error"},{"kind":"group","filterCombination":"or","filters":[{"key":"$metadata.service","type":"string","operation":"eq","value":"checkout"},{"key":"$metadata.service","type":"string","operation":"eq","value":"payments"}]}]}'`,
			"Match errors from checkout or payments"
		)
		.example(
			"cf observability tail --worker my-worker --filters @filters.json",
			"Apply saved filters to a Worker"
		)
		.example(
			"cf observability tail --zone example.com --filters @filters.json",
			"Apply saved filters to a zone and its subdomains"
		)
		.epilogue(
			"Output is newline-delimited JSON. Worker events require Workers logs. Each user can run one live tail per Worker and one account live tail, shared by --all, --zone, and --filters alone. Streaming connections use HTTPS_PROXY and NO_PROXY. --worker requires Worker metadata access. --zone requires Zone read access. Choose one of --all, --worker, or --zone. Use --filters alone or with --worker or --zone. --filters alone selects matching observability events. --zone matches the recorded zone name. Events without a zone name are matched by HTTP request hostname, including subdomains.\n\n" +
				'Condition: {"key": string, "type": "string" | "number" | "boolean", "operation": string, "value"?: (string | number | boolean)}. Group: {"kind": "group", "filterCombination": "and" | "or", "filters": [{...}]}. ? marks optional keys.\n\n' +
				"Operations: eq, neq, gt, gte, lt, lte, includes, not_includes, starts_with, ends_with, regex, in, not_in, exists, is_null. Use a comma-separated string for in/not_in; omit value for exists/is_null. String matching is case-sensitive; regex uses RE2.\n\n" +
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
		const filters = tailFilters(argv.filters);
		const context = await resolveTailContext(argv);
		const body = {
			...(argv.worker === undefined ? {} : { scriptId: argv.worker }),
			...(context.zone === undefined
				? filters
				: scopeTailFilters(filters, zoneFilter(context.zone))),
		};
		if (context.kind === "preview") {
			formatDryRun({
				command: "cf observability tail",
				method: prepareLiveTail.method,
				url: `${context.baseUrl}${prepareLiveTail.path({ account_id: context.accountId })}`,
				pathParams: {},
				bodyKind: "json",
				body,
			});
			return;
		}

		await withTailSignals((signal) =>
			runLiveTail({
				client: context.client,
				accountId: context.accountId,
				body,
				signal,
				notice: (message) => log.info(message),
				warn: (message) => log.warn(message),
			})
		);
	},
};

type TailContext = {
	accountId: string;
	zone: string | undefined;
} & ({ kind: "preview"; baseUrl: string } | { kind: "stream"; client: Client });

async function resolveTailContext(
	argv: CommandClientArgs & { worker?: string; zone?: string }
): Promise<TailContext> {
	if (argv.dryRun) {
		return {
			kind: "preview",
			accountId: (await resolveAccountIdSilent()) ?? "<account-id>",
			zone: argv.zone,
			baseUrl: getCloudflareApiBaseUrl({
				compliance_region: await getComplianceRegion(),
			}).replace(/\/+$/, ""),
		};
	}

	const client = await createCommandClient(argv);
	const accountId = await getAccountId();

	if (argv.worker !== undefined) {
		await client.send(getWorker, {
			account_id: accountId,
			worker_id: argv.worker,
		});
	}

	const zone =
		argv.zone === undefined
			? undefined
			: await resolveTailZone(argv.zone, client);

	return {
		kind: "stream",
		client,
		accountId,
		zone,
	};
}

async function resolveTailZone(zone: string, client: Client): Promise<string> {
	const zoneId = await getZoneId({ zone }, client);
	if (!isId(zone)) {
		return zone.toLowerCase();
	}
	const result = await client.send(getZone, { zone_id: zoneId });
	if (
		!result ||
		typeof result !== "object" ||
		!("name" in result) ||
		typeof result.name !== "string" ||
		!isValidDomainName(result.name)
	) {
		throw new Error("Could not determine the zone's domain name.");
	}
	return result.name.toLowerCase();
}

async function withTailSignals(
	task: (signal: AbortSignal) => Promise<void>
): Promise<void> {
	const controller = new AbortController();
	const onInterrupt = () => controller.abort("SIGINT");
	const onTerminate = () => controller.abort("SIGTERM");
	process.on("SIGINT", onInterrupt);
	process.on("SIGTERM", onTerminate);
	try {
		await task(controller.signal);
	} finally {
		process.off("SIGINT", onInterrupt);
		process.off("SIGTERM", onTerminate);
	}
	if (controller.signal.aborted) {
		const signal =
			controller.signal.reason === "SIGTERM" ? "SIGTERM" : "SIGINT";
		throw new CliExit(signal === "SIGINT" ? 130 : 143, { signal });
	}
}

export default command;
