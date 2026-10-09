import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * create command
 * @generated from apis/overlays/o11y.ts
 */
import type { Argv, CommandModule } from "yargs";
import {
	createCommandClient,
	getAccountId,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { compactBody, parseBody } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { promptForRequiredField } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 o11y shared-queries create\n\nShared queries store the results of a previously run query, allowing you to share the results with others."
		)
		.option("chart", {
			type: "boolean",
			description: "When true, includes time-series data in the response.",
		})
		.option("chart-type", {
			type: "string",
			description:
				"Controls the SQL shape and response payload for the 'calculations' view. Omitted or 'timeseries_and_aggregate': current behaviour — both the time-series and aggregate queries. 'timeseries': time-series only. 'aggregate': aggregate only. 'distribution': a bucketed 2D histogram (time × value buckets) returned in 'distribution' instead of 'calculations'. 'distribution' is not compatible with 'compare' — combining them returns a 400.",
			choices: [
				"timeseries_and_aggregate",
				"timeseries",
				"aggregate",
				"distribution",
			],
		})
		.coerce("chart-type", (value: string | undefined) =>
			resolveFileToken(value, "chart-type", "text")
		)
		.option("compare", {
			type: "boolean",
			description:
				"When true, includes a comparison dataset from the previous time period of equal length.",
		})
		.option("distribution-scale", {
			type: "string",
			description:
				"Value-axis bucketing for chartType 'distribution'. Omitted or 'log': geometric buckets, best for heavy-tailed latency. 'linear': fixed-width buckets, clearer for narrow or additive ranges. Ignored for other chartTypes. The response echoes the scheme used in distribution.bucketMode.",
			choices: ["log", "linear"],
		})
		.coerce("distribution-scale", (value: string | undefined) =>
			resolveFileToken(value, "distribution-scale", "text")
		)
		.option("granularity", {
			type: "number",
			description:
				"Number of time-series buckets. Only used when view is 'calculations'. Omit to let the system auto-detect an appropriate granularity.",
		})
		.option("ignore-series", {
			type: "boolean",
			description:
				"When true, omits time-series data from the response and returns only aggregated values. Reduces response size when series are not needed.",
			default: false,
		})
		.option("limit", {
			type: "number",
			description:
				"Maximum number of events to return when view is 'events'. Also controls the number of group-by rows when view is 'calculations'.",
			default: 50,
		})
		.option("offset", {
			type: "string",
			description:
				"Cursor for pagination in event, trace, invocation, and agent views. Pass the $metadata.id of the last event, the trace cursor, or AgentRun.id to fetch the next page.",
		})
		.option("offset-by", {
			type: "number",
			description:
				"Numeric offset for paginating grouped/pattern results (top-N lists). Use together with limit. Not used by cursor-based pagination.",
		})
		.option("offset-direction", {
			type: "string",
			description:
				"Pagination direction: 'next' for forward, 'prev' for backward.",
		})
		.option("parameters-datasets", {
			type: "string",
			array: true,
			description:
				"Datasets to query. Leave empty to query all available datasets.",
		})
		.option("parameters-filter-combination", {
			type: "string",
			description:
				"Logical operator for combining top-level filters: 'and' (all must match) or 'or' (any must match). Defaults to 'and'.",
			choices: ["and", "or", "AND", "OR"],
		})
		.coerce("parameters-filter-combination", (value: string | undefined) =>
			resolveFileToken(value, "parameters-filter-combination", "text")
		)
		.option("parameters-limit", {
			type: "number",
			description:
				"Maximum number of group-by rows to return in calculation results. A value of 10 is a sensible default for most use cases.",
		})
		.option("parameters-needle-is-regex", {
			type: "boolean",
			description:
				"When true, treats the value as a regular expression (RE2 syntax).",
		})
		.option("parameters-needle-match-case", {
			type: "boolean",
			description:
				"When true, performs a case-sensitive search. Defaults to case-insensitive.",
		})
		.option("parameters-order-by-order", {
			type: "string",
			description:
				"Sort direction: 'asc' for ascending, 'desc' for descending.",
			choices: ["asc", "desc"],
		})
		.coerce("parameters-order-by-order", (value: string | undefined) =>
			resolveFileToken(value, "parameters-order-by-order", "text")
		)
		.option("parameters-order-by-value", {
			type: "string",
			description:
				"Alias of the calculation to order results by. Must match the alias (or operator) of a calculation in the query.",
		})
		.option("query-id", {
			type: "string",
			description:
				"Identifier for the query. When parameters are omitted, this ID is used to load a previously saved query's parameters. When providing parameters inline, pass any identifier (e.g. an ad-hoc ID).",
		})
		.option("timeframe-from", {
			type: "number",
			description:
				"Start timestamp for the query timeframe. Unix timestamp in milliseconds",
		})
		.option("timeframe-to", {
			type: "number",
			description:
				"End timestamp for the query timeframe. Unix timestamp in milliseconds",
		})
		.option("view", {
			type: "string",
			description:
				"Controls the shape of the response. 'events': individual log lines matching the query. 'calculations': aggregated metrics (count, avg, p99, etc.) with optional group-by breakdowns and time-series. 'invocations': events grouped by request ID. 'traces': distributed trace summaries. 'agents': agent-specific trace summaries.",
			choices: [
				"traces",
				"events",
				"calculations",
				"invocations",
				"requests",
				"agents",
			],
			default: "calculations",
		})
		.coerce("view", (value: string | undefined) =>
			resolveFileToken(value, "view", "text")
		)
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		})
		.option("body", {
			type: "string",
			description: "Create a sharable link to a query result.",
		})
		.check((argv) => {
			const groupSet = [
				"parameters-datasets",
				"parameters-filter-combination",
				"parameters-limit",
				"parameters-needle-is-regex",
				"parameters-needle-match-case",
				"parameters-order-by-order",
				"parameters-order-by-value",
			].some((k) => argv[k] !== undefined);
			if (groupSet) {
				const missing = ["parameters-order-by-value"].filter(
					(k) => argv[k] === undefined
				);
				if (missing.length > 0) {
					throw new Error(
						`${missing.map((m) => "--" + m).join(", ")} ${missing.length === 1 ? "is" : "are"} required when any --parameters-* flag is set`
					);
				}
			}
			return true;
		});
}

type Args = InferArgs<typeof builder>;

type Request = SdkRequest<"shared.query.post">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "create",
	describe: "Create a sharable link to a query result",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "o11y shared-queries create",
				classification: {
					safeFlags: [
						"chart",
						"chart-type",
						"compare",
						"distribution-scale",
						"ignore-series",
						"parameters-filter-combination",
						"parameters-needle-is-regex",
						"parameters-needle-match-case",
						"parameters-order-by-order",
						"view",
						"dry-run",
					],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf o11y shared-queries create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/workers/observability/shared/query`,
						pathParams: {},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										chart: argv["chart"],
										chartType: argv["chart-type"],
										compare: argv["compare"],
										distributionScale: argv["distribution-scale"],
										granularity: argv["granularity"],
										ignoreSeries: argv["ignore-series"],
										limit: argv["limit"],
										offset: resolveFileToken(
											argv["offset"] as string | undefined,
											"offset",
											"text"
										),
										offsetBy: argv["offset-by"],
										offsetDirection: resolveFileToken(
											argv["offset-direction"] as string | undefined,
											"offset-direction",
											"text"
										),
										parameters: {
											datasets: argv["parameters-datasets"],
											filterCombination: argv["parameters-filter-combination"],
											limit: argv["parameters-limit"],
											needle: {
												isRegex: argv["parameters-needle-is-regex"],
												matchCase: argv["parameters-needle-match-case"],
											},
											orderBy: {
												order: argv["parameters-order-by-order"],
												value: resolveFileToken(
													argv["parameters-order-by-value"] as
														| string
														| undefined,
													"parameters-order-by-value",
													"text"
												),
											},
										},
										queryId: resolveFileToken(
											argv["query-id"] as string | undefined,
											"query-id",
											"text"
										),
										timeframe: {
											from: argv["timeframe-from"],
											to: argv["timeframe-to"],
										},
										view: argv["view"],
									}),
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (argv.body) {
					const bodyData = parseBody<Request>(argv.body);
					const result = await withProgress(`Creating`, async () =>
						client.observability.sharedQueries.create({
							...bodyData,
							account_id: accountId,
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}
				if (argv["query-id"] === undefined) {
					argv["query-id"] = await promptForRequiredField(
						"query-id",
						"Identifier for the query. When parameters are omitted, this ID is used to load a previously saved query's parameters. When providing parameters inline, pass any identifier (e.g. an ad-hoc ID)."
					);
				}
				if (argv["timeframe-from"] === undefined) {
					throw new Error(
						"--timeframe-from is required (or pass --body with this field set)."
					);
				}
				if (argv["timeframe-to"] === undefined) {
					throw new Error(
						"--timeframe-to is required (or pass --body with this field set)."
					);
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					chart: argv["chart"],
					chartType: argv["chart-type"],
					compare: argv["compare"],
					distributionScale: argv["distribution-scale"],
					granularity: argv["granularity"],
					ignoreSeries: argv["ignore-series"],
					limit: argv["limit"],
					offset: resolveFileToken(
						argv["offset"] as string | undefined,
						"offset",
						"text"
					),
					offsetBy: argv["offset-by"],
					offsetDirection: resolveFileToken(
						argv["offset-direction"] as string | undefined,
						"offset-direction",
						"text"
					),
					parameters: {
						datasets: argv["parameters-datasets"],
						filterCombination: argv["parameters-filter-combination"],
						limit: argv["parameters-limit"],
						needle: {
							isRegex: argv["parameters-needle-is-regex"],
							matchCase: argv["parameters-needle-match-case"],
						},
						orderBy: {
							order: argv["parameters-order-by-order"],
							value: resolveFileToken(
								argv["parameters-order-by-value"] as string | undefined,
								"parameters-order-by-value",
								"text"
							),
						},
					},
					queryId: resolveFileToken(
						argv["query-id"] as string | undefined,
						"query-id",
						"text"
					),
					timeframe: {
						from: argv["timeframe-from"],
						to: argv["timeframe-to"],
					},
					view: argv["view"],
				});
				const result = await withProgress(`Creating`, async () =>
					client.observability.sharedQueries.create({
						...bodyData,
						account_id: accountId,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
};

export default command;
