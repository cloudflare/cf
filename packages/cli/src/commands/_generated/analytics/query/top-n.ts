import operation from "../../_operations/analytics/query/top-n.js";
/**
 * top-n command
 * @generated from apis/overlays/analytics.ts
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
	command: "top-n <dataset>",
	describe: "Query analytics top-N",
	usage:
		"$0 analytics query top-n <dataset>\n\nReturns the top N results for a dataset by a specified stat. Includes an array of result rows, each containing the requested stats and group-by dimensions.",
	flags: {
		filters: {
			kind: "parsed",
			brief:
				'Filters to apply before aggregating results. Provide as a JSON array of objects or @path/to/file.json. Shape: [{"name": string, "op": string, "values": [(string | boolean | number)]}].',
			optional: true,
			parse: String,
		},
		from: {
			kind: "parsed",
			brief:
				"The start of the query time range (inclusive). RFC3339 format with timezone is required (e.g. `2024-11-05T00:00:00Z`).",
			optional: true,
			parse: String,
		},
		"group-by": {
			kind: "parsed",
			brief:
				"Specifies the column names to group results by. Requires valid columns for the target dataset.",
			variadic: true,
			optional: true,
			parse: String,
		},
		stats: {
			kind: "parsed",
			brief:
				"Specifies the stat names to include in results. Requires valid stats for the target dataset (e.g. `attemptsTotal`, `bytesTotal`).",
			variadic: true,
			optional: true,
			parse: String,
		},
		to: {
			kind: "parsed",
			brief:
				"Specifies the end of the query time range (exclusive). Requires RFC3339 format with timezone.",
			optional: true,
			parse: String,
		},
		limit: {
			kind: "parsed",
			brief: "Maximum number of results to return.",
			optional: true,
			parse: Number,
		},
		"order-by": {
			kind: "parsed",
			brief:
				"Specifies the stat name for sorting results in descending order. Requires a valid stat for the target dataset.",
			optional: true,
			parse: String,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		body: {
			kind: "parsed",
			brief: "Raw JSON request body (bypasses individual flags)",
			optional: true,
			parse: String,
		},
	},
	operands: [
		{
			placeholder: "dataset",
			brief:
				"Dataset name to query. Examples: \`access-logins\`, \`gateway-http\`, \`gateway-dns\`, \`gateway-http\`, \`shadow-it\`.",
			parse: String,
		},
	],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "analytics query top-n",
				classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
					typeof argv
				>,
			},
			argv as Record<string, unknown>,
			async () => {
				const resolveRequiredFields = async (): Promise<void> => {
					if (argv["filters"] === undefined) {
						throw new Error(
							"--filters is required (or pass --body with this field set)."
						);
					}
					if (argv["from"] === undefined) {
						argv["from"] = await promptForRequiredField(
							"from",
							"The start of the query time range (inclusive). RFC3339 format with timezone is required (e.g. \`2024-11-05T00:00:00Z\`)."
						);
					}
					if (argv["group-by"] === undefined) {
						throw new Error(
							"--group-by is required (or pass --body with this field set)."
						);
					}
					if (argv["stats"] === undefined) {
						throw new Error(
							"--stats is required (or pass --body with this field set)."
						);
					}
					if (argv["to"] === undefined) {
						argv["to"] = await promptForRequiredField(
							"to",
							"Specifies the end of the query time range (exclusive). Requires RFC3339 format with timezone."
						);
					}
					if (argv["limit"] === undefined) {
						throw new Error(
							"--limit is required (or pass --body with this field set)."
						);
					}
					if (argv["order-by"] === undefined) {
						argv["order-by"] = await promptForRequiredField(
							"order-by",
							"Specifies the stat name for sorting results in descending order. Requires a valid stat for the target dataset."
						);
					}
				};
				if (argv.dryRun) {
					if (argv.body === undefined) {
						await resolveRequiredFields();
					}
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf analytics query top-n",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/analytics/query/${argv["dataset"] == null ? "<dataset>" : encodeURIComponent(String(argv["dataset"]))}/top-n`,
						pathParams: { dataset: String(argv["dataset"] ?? "") },
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										filters: parseObjectArray(argv["filters"], "filters"),
										from: resolveFileToken(
											argv["from"] as string | undefined,
											"from",
											"text"
										),
										groupBy: argv["group-by"],
										stats: argv["stats"],
										to: resolveFileToken(
											argv["to"] as string | undefined,
											"to",
											"text"
										),
										n: argv["limit"],
										orderBy: resolveFileToken(
											argv["order-by"] as string | undefined,
											"order-by",
											"text"
										),
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
					const result = await withProgress(`Creating`, async () =>
						client.send(operation, {
							body: bodyData,
							account_id: accountId,
							dataset: argv["dataset"],
						})
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}
				await resolveRequiredFields();

				// Assemble request body from individual flags
				const bodyData = compactBody({
					filters: parseObjectArray(argv["filters"], "filters"),
					from: resolveFileToken(
						argv["from"] as string | undefined,
						"from",
						"text"
					),
					groupBy: argv["group-by"],
					stats: argv["stats"],
					to: resolveFileToken(argv["to"] as string | undefined, "to", "text"),
					n: argv["limit"],
					orderBy: resolveFileToken(
						argv["order-by"] as string | undefined,
						"order-by",
						"text"
					),
				});
				const result = await withProgress(`Creating`, async () =>
					client.send(operation, {
						body: bodyData,
						account_id: accountId,
						dataset: argv["dataset"],
					})
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
});

export default command;
