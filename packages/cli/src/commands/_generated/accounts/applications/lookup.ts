import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkQuery, SdkRequest } from "#sdk";
/**
 * lookup command
 * @generated from apis/overlays/accounts.ts
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
			"$0 accounts applications lookup\n\nFind complete application names mentioned in a rule sentence, ignoring case. Lookup does not correct misspellings. Matches are ranked by relevance. This endpoint takes the rule sentence in the request body, so the text stays out of URLs and request logs. Use it instead of the `lookup` query parameter on the list endpoint when the text may contain sensitive content. `fields`, `limit`, and `filter` work the same way as on the list endpoint and are passed as query parameters. Results are not paged: `offset`, `order_by`, `search`, and `lookup` query parameters return `400`. Unknown request body properties also return `400`. Invalid UTF-8 or a NUL character (U+0000) in any query parameter name or value returns `400`. The authenticated principal must have access to the account identified by `account_id`."
		)
		.option("filter", {
			type: "string",
			description:
				"Filter matches using the same `key:value` filters as the list endpoint.",
		})
		.option("limit", {
			type: "number",
			description:
				"Maximum number of matches to return. Defaults to 25; values are clamped to 1–250.",
		})
		.option("fields", {
			type: "string",
			description:
				"Return only the listed properties on each application, as a comma-separated list.\nAccepts the same properties as the list endpoint. `id` is always returned.\nOmit this parameter to receive the full application object.",
		})
		.option("lookup", {
			type: "string",
			description:
				"Rule sentence to search for complete application names. Leading and trailing\nwhitespace is trimmed before the length is checked. Control characters other\nthan tab and line breaks return `400`.\n",
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

type Request = SdkRequest<"lookupResourceLibraryApplications">;
type Body = Request;
type Query = SdkQuery<"lookupResourceLibraryApplications">;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "lookup",
	describe: "Look up applications in a rule sentence",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "accounts applications lookup",
				classification: {
					safeFlags: ["dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Query = {
					filter: argv["filter"],
					limit: argv["limit"],
					fields: argv["fields"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf accounts applications lookup",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/resource-library/applications/lookup`,
						pathParams: {},
						query: queryParams,
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										lookup: resolveFileToken(
											argv["lookup"] as string | undefined,
											"lookup",
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
					const qs = new URLSearchParams(
						Object.entries(queryParams)
							.filter(([, v]) => v !== undefined)
							.map(([k, v]) => [k, String(v)])
					).toString();
					const result = await withProgress(`Creating`, async () =>
						client.accounts.applications.lookup({
							...bodyData,
							account_id: accountId,
							...queryParams,
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}
				if (argv["lookup"] === undefined) {
					argv["lookup"] = await promptForRequiredField(
						"lookup",
						"Rule sentence to search for complete application names. Leading and trailing whitespace is trimmed before the length is checked. Control characters other than tab and line breaks return \`400\`. "
					);
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					lookup: resolveFileToken(
						argv["lookup"] as string | undefined,
						"lookup",
						"text"
					),
				});
				const qs = new URLSearchParams(
					Object.entries(queryParams)
						.filter(([, v]) => v !== undefined)
						.map(([k, v]) => [k, String(v)])
				).toString();
				const result = await withProgress(`Creating`, async () =>
					client.accounts.applications.lookup({
						...bodyData,
						account_id: accountId,
						...queryParams,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
};

export default command;
