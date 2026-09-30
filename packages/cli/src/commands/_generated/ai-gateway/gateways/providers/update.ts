import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * update command
 * @generated from apis/overlays/ai-gateway.ts
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
			"$0 ai-gateway gateways providers update <id>\n\nReplaces the stored API key of a provider key configuration. Only the key can change."
		)
		.positional("id", {
			type: "string",
			description: "ID",
			demandOption: true,
		})
		.option("gateway-id", {
			type: "string",
			description: "Unique identifier of the AI Gateway within the account.",
			demandOption: true,
		})
		.option("secret", {
			type: "string",
			description:
				"Provider API key to store in the Secrets Store configured on the gateway.",
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		})
		.option("show-secrets", {
			type: "boolean",
			description: "Show sensitive values in dry-run output",
			default: false,
		})
		.option("body", {
			type: "string",
			description: "Raw JSON request body (bypasses individual flags)",
		});
}

type Args = InferArgs<typeof builder>;

type Request = SdkRequest<"aig-config-update-providers">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "update <id>",
	describe: "Rotate a provider key",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "ai-gateway gateways providers update",
				classification: {
					safeFlags: ["dry-run", "show-secrets"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun(
						{
							command: "cf ai-gateway gateways providers update",
							method: "PUT",
							url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/ai-gateway/gateways/${argv["gateway-id"] == null ? "<gateway-id>" : encodeURIComponent(String(argv["gateway-id"]))}/provider_configs/${argv["id"] == null ? "<id>" : encodeURIComponent(String(argv["id"]))}`,
							pathParams: {
								"gateway-id": String(argv["gateway-id"] ?? ""),
								id: String(argv["id"] ?? ""),
							},
							bodyKind: "json",
							body:
								argv.body !== undefined
									? parseBody(argv.body)
									: compactBody({
											secret: resolveFileToken(
												argv["secret"] as string | undefined,
												"secret",
												"text"
											),
										}),
						},
						{ sensitiveBodyPaths: [["secret"]], showSecrets: argv.showSecrets }
					);
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (argv.body) {
					const bodyData = parseBody<Request>(argv.body);
					const result = await withProgress(`Updating`, async () =>
						client.aiGateway.gateways.providers.update({
							...bodyData,
							account_id: accountId,
							gateway_id: argv["gateway-id"],
							id: argv["id"],
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}
				if (argv["secret"] === undefined) {
					argv["secret"] = await promptForRequiredField(
						"secret",
						"Provider API key to store in the Secrets Store configured on the gateway.",
						{ kind: "secret" }
					);
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					secret: resolveFileToken(
						argv["secret"] as string | undefined,
						"secret",
						"text"
					),
				});
				const result = await withProgress(`Updating`, async () =>
					client.aiGateway.gateways.providers.update({
						...bodyData,
						account_id: accountId,
						gateway_id: argv["gateway-id"],
						id: argv["id"],
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
};

export default command;
