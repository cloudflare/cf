import operation from "../../../_operations/cloudforce-one/threat-intel/events/search.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
/**
 * search command
 * @generated from apis/overlays/cloudforce-one.ts
 */
import type { Argv, CommandModule } from "yargs";
import {
	createCommandClient,
	getAccountId,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import {
	compactBody,
	parseBody,
	parseNestedArray,
	parseObjectArray,
} from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 cloudforce-one threat-intel events search\n\nLists events, with filters sent in a JSON request body. Accepts the same filters as `threat-intel events list` and suits long or complex `search` filters. `datasetId` accepts dataset UUIDs or one scope value used alone: `all` (or `*`) and `operational` select the intelligence datasets you can read, and `analytics` selects the analytics datasets you can read. A scope value covers at most 50 datasets. Without `datasetId`, the default Cloudforce One Threat Events dataset is used."
		)
		.option("force-refresh", { type: "boolean", description: "ForceRefresh" })
		.option("format", {
			type: "string",
			description:
				"Output format for event data. 'json' returns the default format, 'stix2' returns STIX 2.1 Sighting SROs with linked Indicator SDOs, Observed Data SDOs, and SCOs, 'taxii' returns a TAXII 2.1 Envelope with Content-Type application/taxii+json;version=2.1.",
			choices: ["json", "stix2", "taxii"],
		})
		.option("cache", {
			type: "string",
			description:
				"Cache strategy. 'from-graph' serves results from the graph-node KV cache when all requested UUIDs are cached; falls back to normal path on partial/zero hit.",
			choices: ["from-graph"],
		})
		.option("cursor", {
			type: "string",
			description:
				"Cursor for pagination. When provided, filters are embedded in the cursor so you only need to pass cursor and pageSize.",
		})
		.option("dataset-id", {
			type: "string",
			array: true,
			description:
				"Dataset UUIDs to query, or one standalone scope value: 'all'/'*' or 'operational' for readable intelligence datasets (isAnalytics=false), or 'analytics' for readable analytics datasets (isAnalytics=true). Scope values query at most 50 datasets. If not provided, uses the default dataset.",
		})
		.option("order", {
			type: "string",
			description: "The order field",
			choices: ["asc", "desc"],
		})
		.coerce("order", (value) => resolveFileToken(value, "order", "text"))
		.option("order-by", { type: "string", description: "The orderBy field" })
		.option("page", { type: "number", description: "The page field" })
		.option("page-size", { type: "number", description: "The pageSize field" })
		.option("search", {
			type: "string",
			description:
				"Structured search as a JSON array of {field, op, value} objects. Use the 'in' operator with an array value to bulk-check up to 100 values. Multiple conditions are AND'd together. Max 10 conditions per request. Provide as a JSON array of objects or @path/to/file.json.",
		})
		.option("search-branches", {
			type: "string",
			description:
				"OR branches of structured search filters. Filters within a branch are AND'd, branches are OR'd, and the result is AND'd with `search`: `AND(search) AND OR(AND(branch 1), ...)`. Max 8 branches of 1-10 conditions each. Not supported for analytics datasets, and `indicator` filters are not yet supported inside branches. Cursor pages carry the original branches, so do not resend them with `cursor`. Provide as a JSON array of arrays or @path/to/file.json.",
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		})
		.option("body", {
			type: "string",
			description: "Raw JSON request body (bypasses individual flags)",
		});
}

type Args = InferArgs<typeof builder>;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "search",
	describe: "Search events",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "cloudforce-one threat-intel events search",
				classification: {
					safeFlags: ["force-refresh", "format", "cache", "order", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
					forceRefresh: argv["force-refresh"],
					format: argv["format"],
					cache: argv["cache"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf cloudforce-one threat-intel events search",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/cloudforce-one/events`,
						pathParams: {},
						query: queryParams,
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										cursor: resolveFileToken(
											argv["cursor"] as string | undefined,
											"cursor",
											"text"
										),
										datasetId: argv["dataset-id"],
										order: argv["order"],
										orderBy: resolveFileToken(
											argv["order-by"] as string | undefined,
											"order-by",
											"text"
										),
										page: argv["page"],
										pageSize: argv["page-size"],
										search: parseObjectArray(argv["search"], "search"),
										searchBranches: parseNestedArray(
											argv["search-branches"],
											"search-branches"
										),
									}),
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (argv.body) {
					const bodyData = parseBody(argv.body);
					const qs = new URLSearchParams(
						Object.entries(queryParams)
							.filter(([, v]) => v !== undefined)
							.map(([k, v]) => [k, String(v)])
					).toString();
					const result = await withProgress(`Loading`, async () =>
						client.send(operation, {
							body: bodyData,
							account_id: accountId,
							...queryParams,
						})
					);
					formatOutput(result, { successLabel: `Loaded` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData = compactBody({
					cursor: resolveFileToken(
						argv["cursor"] as string | undefined,
						"cursor",
						"text"
					),
					datasetId: argv["dataset-id"],
					order: argv["order"],
					orderBy: resolveFileToken(
						argv["order-by"] as string | undefined,
						"order-by",
						"text"
					),
					page: argv["page"],
					pageSize: argv["page-size"],
					search: parseObjectArray(argv["search"], "search"),
					searchBranches: parseNestedArray(
						argv["search-branches"],
						"search-branches"
					),
				});
				const qs = new URLSearchParams(
					Object.entries(queryParams)
						.filter(([, v]) => v !== undefined)
						.map(([k, v]) => [k, String(v)])
				).toString();
				const result = await withProgress(`Loading`, async () =>
					client.send(operation, {
						body: bodyData,
						account_id: accountId,
						...queryParams,
					})
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
};

export default command;
