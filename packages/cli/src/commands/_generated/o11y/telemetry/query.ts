import operation from "../../_operations/o11y/telemetry/query.js";
/**
 * query command
 * @generated from apis/overlays/o11y.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
import {
	createCommandClient,
	getAccountId,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { compactBody, parseBody, parseObjectArray } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { promptForRequiredField } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "query",
	describe: "Run a query",
	usage: "$0 o11y telemetry query\n\nRun a temporary or saved query.",
	flags: {
		chart: {
			kind: "boolean",
			brief: "When true, includes time-series data in the response.",
			optional: true,
		},
		"chart-type": {
			kind: "parsed",
			brief:
				"Controls the SQL shape and response payload for the 'calculations' view. Omitted or 'timeseries_and_aggregate': current behaviour — both the time-series and aggregate queries. 'timeseries': time-series only. 'aggregate': aggregate only. 'distribution': a bucketed 2D histogram (time × value buckets) returned in 'distribution' instead of 'calculations'. 'distribution' is not compatible with 'compare' — combining them returns a 400.",
			optional: true,
			choices: [
				"timeseries_and_aggregate",
				"timeseries",
				"aggregate",
				"distribution",
			],
			parse: String,
			coerce: (value: string) => resolveFileToken(value, "chart-type", "text"),
		},
		compare: {
			kind: "boolean",
			brief:
				"When true, includes a comparison dataset from the previous time period of equal length.",
			optional: true,
		},
		"distribution-scale": {
			kind: "parsed",
			brief:
				"Value-axis bucketing for chartType 'distribution'. Omitted or 'log': geometric buckets, best for heavy-tailed latency. 'linear': fixed-width buckets, clearer for narrow or additive ranges. Ignored for other chartTypes. The response echoes the scheme used in distribution.bucketMode.",
			optional: true,
			choices: ["log", "linear"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "distribution-scale", "text"),
		},
		preview: {
			kind: "boolean",
			brief:
				"When true, executes the query without persisting the results. Useful for validation or previewing.",
			default: false,
		},
		granularity: {
			kind: "parsed",
			brief:
				"Number of time-series buckets. Only used when view is 'calculations'. Omit to let the system auto-detect an appropriate granularity.",
			optional: true,
			parse: Number,
		},
		"ignore-series": {
			kind: "boolean",
			brief:
				"When true, omits time-series data from the response and returns only aggregated values. Reduces response size when series are not needed.",
			default: false,
		},
		limit: {
			kind: "parsed",
			brief:
				"Maximum number of events to return when view is 'events'. Also controls the number of group-by rows when view is 'calculations'.",
			default: "50",
			parse: Number,
		},
		offset: {
			kind: "parsed",
			brief:
				"Cursor for pagination in event, trace, invocation, and agent views. Pass the $metadata.id of the last event, the trace cursor, or AgentRun.id to fetch the next page.",
			optional: true,
			parse: String,
		},
		"offset-by": {
			kind: "parsed",
			brief:
				"Numeric offset for paginating grouped/pattern results (top-N lists). Use together with limit. Not used by cursor-based pagination.",
			optional: true,
			parse: Number,
		},
		"offset-direction": {
			kind: "parsed",
			brief: "Pagination direction: 'next' for forward, 'prev' for backward.",
			optional: true,
			parse: String,
		},
		"parameters-calculations": {
			kind: "parsed",
			brief:
				'Aggregation calculations to compute (e.g. count, avg, p99). Each calculation produces aggregate values and optional time-series data. Provide as a JSON array of objects or @path/to/file.json. Shape: [({"operator": "count" | "COUNT", "alias"?: string, "key"?: string, "keyType"?: "string" | "number" | "boolean"} | ...more)]. ? marks optional keys.',
			optional: true,
			parse: String,
		},
		"parameters-datasets": {
			kind: "parsed",
			brief: "Datasets to query. Leave empty to query all available datasets.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"parameters-filter-combination": {
			kind: "parsed",
			brief:
				"Logical operator for combining top-level filters: 'and' (all must match) or 'or' (any must match). Defaults to 'and'.",
			optional: true,
			choices: ["and", "or", "AND", "OR"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "parameters-filter-combination", "text"),
		},
		"parameters-filters": {
			kind: "parsed",
			brief:
				'Filters to narrow query results. Use the keys and values endpoints to discover available fields before building filters. Supports nested groups via kind: \'group\'. Maximum nesting depth is 4. Provide as a JSON array of objects or @path/to/file.json. Shape: [({"filterCombination": "and" | "or" | "AND" | ...more, "filters": [{...}], "kind": "group"} | ...more)].',
			optional: true,
			parse: String,
		},
		"parameters-group-bys": {
			kind: "parsed",
			brief:
				'Fields to group calculation results by. Only applicable when the query view is \'calculations\'. Produces per-group aggregate values. Provide as a JSON array of objects or @path/to/file.json. Shape: [{"type": "string" | "number" | "boolean", "value": string}].',
			optional: true,
			parse: String,
		},
		"parameters-havings": {
			kind: "parsed",
			brief:
				'Post-aggregation filters applied to calculation results. Use to filter groups after aggregation (e.g. only groups where count > 100). Provide as a JSON array of objects or @path/to/file.json. Shape: [{"key": string, "operation": "eq" | "neq" | "gt" | ...more, "value": number}].',
			optional: true,
			parse: String,
		},
		"parameters-limit": {
			kind: "parsed",
			brief:
				"Maximum number of group-by rows to return in calculation results. A value of 10 is a sensible default for most use cases.",
			optional: true,
			parse: Number,
		},
		"parameters-needle-is-regex": {
			kind: "boolean",
			brief:
				"When true, treats the value as a regular expression (RE2 syntax).",
			optional: true,
		},
		"parameters-needle-match-case": {
			kind: "boolean",
			brief:
				"When true, performs a case-sensitive search. Defaults to case-insensitive.",
			optional: true,
		},
		"parameters-order-by-order": {
			kind: "parsed",
			brief: "Sort direction: 'asc' for ascending, 'desc' for descending.",
			optional: true,
			choices: ["asc", "desc"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "parameters-order-by-order", "text"),
		},
		"parameters-order-by-value": {
			kind: "parsed",
			brief:
				"Alias of the calculation to order results by. Must match the alias (or operator) of a calculation in the query.",
			optional: true,
			parse: String,
		},
		"query-id": {
			kind: "parsed",
			brief:
				"Identifier for the query. When parameters are omitted, this ID is used to load a previously saved query's parameters. When providing parameters inline, pass any identifier (e.g. an ad-hoc ID).",
			optional: true,
			parse: String,
		},
		"timeframe-from": {
			kind: "parsed",
			brief:
				"Start timestamp for the query timeframe. Unix timestamp in milliseconds",
			optional: true,
			parse: Number,
		},
		"timeframe-to": {
			kind: "parsed",
			brief:
				"End timestamp for the query timeframe. Unix timestamp in milliseconds",
			optional: true,
			parse: Number,
		},
		view: {
			kind: "parsed",
			brief:
				"Controls the shape of the response. 'events': individual log lines matching the query. 'calculations': aggregated metrics (count, avg, p99, etc.) with optional group-by breakdowns and time-series. 'invocations': events grouped by request ID. 'traces': distributed trace summaries. 'agents': agent-specific trace summaries.",
			default: "calculations",
			choices: [
				"traces",
				"events",
				"calculations",
				"invocations",
				"requests",
				"agents",
			],
			parse: String,
			coerce: (value: string) => resolveFileToken(value, "view", "text"),
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		body: {
			kind: "parsed",
			brief:
				"Query your observability events, requests, and traces to build visualizations and identify insights.",
			optional: true,
			parse: String,
		},
	},
	operands: [],
	rules(rules) {
		rules.check((argv) => {
			const groupSet = [
				"parameters-order-by-order",
				"parameters-order-by-value",
			].some((k) => argv[k] !== undefined);
			if (!argv.body && groupSet) {
				const missing = ["parameters-order-by-value"].filter(
					(k) => argv[k] === undefined
				);
				if (missing.length > 0) {
					throw new Error(
						`${missing.map((m) => "--" + m).join(", ")} ${missing.length === 1 ? "is" : "are"} required when any --parameters-order-by-* flag is set`
					);
				}
			}
			return true;
		});
	},
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "o11y telemetry query",
				classification: {
					safeFlags: [
						"chart",
						"chart-type",
						"compare",
						"distribution-scale",
						"preview",
						"ignore-series",
						"parameters-filter-combination",
						"parameters-needle-is-regex",
						"parameters-needle-match-case",
						"parameters-order-by-order",
						"view",
						"dry-run",
					],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const resolveRequiredFields = async (): Promise<void> => {
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
				};
				if (argv.dryRun) {
					if (argv.body === undefined) {
						await resolveRequiredFields();
					}
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf o11y telemetry query",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/workers/observability/telemetry/query`,
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
										dry: argv["preview"],
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
											calculations: parseObjectArray(
												argv["parameters-calculations"],
												"parameters-calculations"
											),
											datasets: argv["parameters-datasets"],
											filterCombination: argv["parameters-filter-combination"],
											filters: parseObjectArray(
												argv["parameters-filters"],
												"parameters-filters"
											),
											groupBys: parseObjectArray(
												argv["parameters-group-bys"],
												"parameters-group-bys"
											),
											havings: parseObjectArray(
												argv["parameters-havings"],
												"parameters-havings"
											),
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
				const parsedBody =
					argv.body !== undefined ? parseBody(argv.body) : undefined;
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (argv.body !== undefined) {
					const bodyData = parsedBody;
					const result = await withProgress(`Loading`, async () =>
						client.send(operation, { body: bodyData, account_id: accountId })
					);
					formatOutput(result, { successLabel: `Loaded` });
					return;
				}
				await resolveRequiredFields();

				// Assemble request body from individual flags
				const bodyData = compactBody({
					chart: argv["chart"],
					chartType: argv["chart-type"],
					compare: argv["compare"],
					distributionScale: argv["distribution-scale"],
					dry: argv["preview"],
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
						calculations: parseObjectArray(
							argv["parameters-calculations"],
							"parameters-calculations"
						),
						datasets: argv["parameters-datasets"],
						filterCombination: argv["parameters-filter-combination"],
						filters: parseObjectArray(
							argv["parameters-filters"],
							"parameters-filters"
						),
						groupBys: parseObjectArray(
							argv["parameters-group-bys"],
							"parameters-group-bys"
						),
						havings: parseObjectArray(
							argv["parameters-havings"],
							"parameters-havings"
						),
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
				const result = await withProgress(`Loading`, async () =>
					client.send(operation, { body: bodyData, account_id: accountId })
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
});

export default command;
