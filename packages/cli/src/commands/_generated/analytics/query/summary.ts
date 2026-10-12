import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * summary command
 * @generated from apis/overlays/analytics.ts
 */
import type { Argv, CommandModule } from "yargs";
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

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 analytics query summary <dataset>\n\nReturns aggregate summary stats for a dataset. Includes current-period and previous-period totals for trend comparison."
		)
		.positional("dataset", {
			type: "string",
			description:
				"Dataset name to query. Examples: \`access-logins\`, \`gateway-http\`, \`gateway-dns\`, \`gateway-http\`, \`shadow-it\`.",
			demandOption: true,
		})
		.option("filters", {
			type: "string",
			description:
				"Filters to apply before aggregating results. Provide as a JSON array of objects or @path/to/file.json.",
		})
		.option("from", {
			type: "string",
			description:
				"The start of the query time range (inclusive). RFC3339 format with timezone is required (e.g. `2024-11-05T00:00:00Z`).",
		})
		.option("group-by", {
			type: "string",
			array: true,
			description:
				"Specifies the column names to group results by. Requires valid columns for the target dataset.",
		})
		.option("stats", {
			type: "string",
			array: true,
			description:
				"Specifies the stat names to include in results. Requires valid stats for the target dataset (e.g. `attemptsTotal`, `bytesTotal`).",
		})
		.option("to", {
			type: "string",
			description:
				"Specifies the end of the query time range (exclusive). Requires RFC3339 format with timezone.",
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		})
		.option("body", {
			type: "string",
			description: "Defines fields that all query types share.",
		});
}

type Args = InferArgs<typeof builder>;

type Request = SdkRequest<"art-analytics-query-summary">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "summary <dataset>",
	describe: "Query analytics summary",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "analytics query summary",
				classification: {
					safeFlags: ["dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf analytics query summary",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/analytics/query/${argv["dataset"] == null ? "<dataset>" : encodeURIComponent(String(argv["dataset"]))}/summary`,
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
						client.analytics.query.summary({
							...bodyData,
							account_id: accountId,
							dataset: argv["dataset"],
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}
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

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					filters: parseObjectArray(argv["filters"], "filters"),
					from: resolveFileToken(
						argv["from"] as string | undefined,
						"from",
						"text"
					),
					groupBy: argv["group-by"],
					stats: argv["stats"],
					to: resolveFileToken(argv["to"] as string | undefined, "to", "text"),
				});
				const result = await withProgress(`Creating`, async () =>
					client.analytics.query.summary({
						...bodyData,
						account_id: accountId,
						dataset: argv["dataset"],
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
};

export default command;
