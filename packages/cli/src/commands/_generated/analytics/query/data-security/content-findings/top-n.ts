import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * top-n command
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
			"$0 analytics query data-security content-findings top-n\n\nReturns the top N integrations ranked by total content findings."
		)
		.option("filters", {
			type: "string",
			description:
				"Filters to apply. `findingType = content` is applied automatically for CASB data. Provide as a JSON array of objects or @path/to/file.json.",
		})
		.option("from", {
			type: "string",
			description: "Start of the query time range (inclusive). RFC3339.",
		})
		.option("limit", {
			type: "number",
			description: "Maximum number of integrations to return.",
		})
		.option("to", {
			type: "string",
			description: "End of the query time range (exclusive). RFC3339.",
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		})
		.option("body", {
			type: "string",
			description: "Returns the top N integrations for content findings.",
		});
}

type Args = InferArgs<typeof builder>;

type Request = SdkRequest<"data-security-content-findings-top-n">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "top-n",
	describe: "Top integrations by content findings",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "analytics query data-security content-findings top-n",
				classification: {
					safeFlags: ["dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf analytics query data-security content-findings top-n",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/analytics/query/data-security/content-findings/top-n`,
						pathParams: {},
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
										n: argv["limit"],
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
						client.analytics.query.dataSecurity.contentFindings.topN({
							...bodyData,
							account_id: accountId,
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
						"Start of the query time range (inclusive). RFC3339."
					);
				}
				if (argv["limit"] === undefined) {
					throw new Error(
						"--limit is required (or pass --body with this field set)."
					);
				}
				if (argv["to"] === undefined) {
					argv["to"] = await promptForRequiredField(
						"to",
						"End of the query time range (exclusive). RFC3339."
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
					n: argv["limit"],
					to: resolveFileToken(argv["to"] as string | undefined, "to", "text"),
				});
				const result = await withProgress(`Creating`, async () =>
					client.analytics.query.dataSecurity.contentFindings.topN({
						...bodyData,
						account_id: accountId,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
};

export default command;
