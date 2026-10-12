import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * update command
 * @generated from apis/overlays/ai-search.ts
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
			"$0 ai-search tokens update <token-id>\n\nReplace a stored AI Search credential and invalidate cached credentials for instances that use it."
		)
		.positional("token-id", {
			type: "string",
			description: "Stored credential record ID.",
			demandOption: true,
		})
		.option("api-token-id", {
			type: "string",
			description: "The cf_api_id field",
		})
		.option("api-token", {
			type: "string",
			description: "The cf_api_key field",
		})
		.option("legacy", { type: "boolean", description: "The legacy field" })
		.option("name", { type: "string", description: "The name field" })
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

type Request = SdkRequest<"ai-search-update-tokens">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "update <token-id>",
	describe: "Update a token",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "ai-search tokens update",
				classification: {
					safeFlags: ["legacy", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf ai-search tokens update",
						method: "PUT",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/ai-search/tokens/${argv["token-id"] == null ? "<token-id>" : encodeURIComponent(String(argv["token-id"]))}`,
						pathParams: { "token-id": String(argv["token-id"] ?? "") },
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										cf_api_id: resolveFileToken(
											argv["api-token-id"] as string | undefined,
											"api-token-id",
											"text"
										),
										cf_api_key: resolveFileToken(
											argv["api-token"] as string | undefined,
											"api-token",
											"text"
										),
										legacy: argv["legacy"],
										name: resolveFileToken(
											argv["name"] as string | undefined,
											"name",
											"text"
										),
									}),
						sensitiveBodyPaths: [["cf_api_key"]],
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (argv.body) {
					const bodyData = parseBody<Request>(argv.body);
					const result = await withProgress(`Updating`, async () =>
						client.aiSearch.tokens.update({
							...bodyData,
							account_id: accountId,
							"token-id": argv["token-id"],
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}
				if (argv["api-token-id"] === undefined) {
					argv["api-token-id"] = await promptForRequiredField(
						"api-token-id",
						"The cf_api_id field"
					);
				}
				if (argv["api-token"] === undefined) {
					argv["api-token"] = await promptForRequiredField(
						"api-token",
						"The cf_api_key field",
						{ kind: "secret" }
					);
				}
				if (argv["name"] === undefined) {
					argv["name"] = await promptForRequiredField("name", "The name field");
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					cf_api_id: resolveFileToken(
						argv["api-token-id"] as string | undefined,
						"api-token-id",
						"text"
					),
					cf_api_key: resolveFileToken(
						argv["api-token"] as string | undefined,
						"api-token",
						"text"
					),
					legacy: argv["legacy"],
					name: resolveFileToken(
						argv["name"] as string | undefined,
						"name",
						"text"
					),
				});
				const result = await withProgress(`Updating`, async () =>
					client.aiSearch.tokens.update({
						...bodyData,
						account_id: accountId,
						"token-id": argv["token-id"],
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
};

export default command;
