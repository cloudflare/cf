import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * create command
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
			"$0 ai-search tokens create <name>\n\nCreate a stored Cloudflare credential for an AI Search instance to access its data source."
		)
		.positional("name", {
			type: "string",
			description: "Human-readable name for the credential.",
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
		.option("legacy", {
			type: "boolean",
			description: "The legacy field",
			default: true,
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

type Request = SdkRequest<"ai-search-create-tokens">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "create <name>",
	describe: "Create a token",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "ai-search tokens create",
				classification: {
					safeFlags: ["legacy", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf ai-search tokens create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/ai-search/tokens`,
						pathParams: {},
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
										name: argv["name"],
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
					const result = await withProgress(`Creating`, async () =>
						client.aiSearch.tokens.create({
							...bodyData,
							account_id: accountId,
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Created` });
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
					name: argv["name"],
				});
				const result = await withProgress(`Creating`, async () =>
					client.aiSearch.tokens.create({
						...bodyData,
						account_id: accountId,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
};

export default command;
