import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * websearch command
 * @generated from apis/overlays/ai.ts
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
			"$0 ai websearch\n\nRun a web search through a configured AI Gateway."
		)
		.option("byok-alias", {
			type: "string",
			description: "The byokAlias field",
		})
		.option("limit", { type: "number", description: "The limit field" })
		.option("options-gateway-id", {
			type: "string",
			description: "The options.gateway.id field",
		})
		.option("provider", { type: "string", description: "The provider field" })
		.option("query", { type: "string", description: "The query field" })
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

type Request = SdkRequest<"workers-ai-ai-gateway-web-search">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "websearch",
	describe: "Search the web through AI Gateway",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "ai websearch",
				classification: {
					safeFlags: ["dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf ai websearch",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/ai/websearch`,
						pathParams: {},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										byokAlias: resolveFileToken(
											argv["byok-alias"] as string | undefined,
											"byok-alias",
											"text"
										),
										limit: argv["limit"],
										options: {
											gateway: {
												id: resolveFileToken(
													argv["options-gateway-id"] as string | undefined,
													"options-gateway-id",
													"text"
												),
											},
										},
										provider: resolveFileToken(
											argv["provider"] as string | undefined,
											"provider",
											"text"
										),
										query: resolveFileToken(
											argv["query"] as string | undefined,
											"query",
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
						client.ai.websearch({
							...bodyData,
							account_id: accountId,
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}
				if (argv["options-gateway-id"] === undefined) {
					argv["options-gateway-id"] = await promptForRequiredField(
						"options-gateway-id",
						"The options.gateway.id field"
					);
				}
				if (argv["query"] === undefined) {
					argv["query"] = await promptForRequiredField(
						"query",
						"The query field"
					);
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					byokAlias: resolveFileToken(
						argv["byok-alias"] as string | undefined,
						"byok-alias",
						"text"
					),
					limit: argv["limit"],
					options: {
						gateway: {
							id: resolveFileToken(
								argv["options-gateway-id"] as string | undefined,
								"options-gateway-id",
								"text"
							),
						},
					},
					provider: resolveFileToken(
						argv["provider"] as string | undefined,
						"provider",
						"text"
					),
					query: resolveFileToken(
						argv["query"] as string | undefined,
						"query",
						"text"
					),
				});
				const result = await withProgress(`Creating`, async () =>
					client.ai.websearch({
						...bodyData,
						account_id: accountId,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
};

export default command;
