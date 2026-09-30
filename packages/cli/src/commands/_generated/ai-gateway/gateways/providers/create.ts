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
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * create command
 * @generated from apis/overlays/ai-gateway.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 ai-gateway gateways providers create <gateway-id>\n\nStores an upstream AI provider API key for an AI Gateway in the Secrets Store configured on the gateway, with an optional rate limit. Pass `secret` to store a new key, or omit it to use an existing Secrets Store secret."
		)
		.positional("gateway-id", {
			type: "string",
			description: "Unique identifier of the AI Gateway within the account.",
			demandOption: true,
		})
		.option("alias", { type: "string", description: "The alias field" })
		.option("default-config", {
			type: "boolean",
			description: "The default_config field",
		})
		.option("provider-slug", {
			type: "string",
			description: "The provider_slug field",
		})
		.option("rate-limit", {
			type: "number",
			description: "The rate_limit field",
		})
		.option("rate-limit-period", {
			type: "number",
			description: "The rate_limit_period field",
			default: 60,
		})
		.option("secret", {
			type: "string",
			description:
				"Provider API key to store in the Secrets Store configured on the gateway.",
		})
		.option("secret-id", { type: "string", description: "The secret_id field" })
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

type Request = SdkRequest<"aig-config-create-providers">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "create <gateway-id>",
	describe: "Store a provider key",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "ai-gateway gateways providers create",
				classification: {
					safeFlags: ["default-config", "dry-run", "show-secrets"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun(
						{
							command: "cf ai-gateway gateways providers create",
							method: "POST",
							url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/ai-gateway/gateways/${argv["gateway-id"] == null ? "<gateway-id>" : encodeURIComponent(String(argv["gateway-id"]))}/provider_configs`,
							pathParams: { "gateway-id": String(argv["gateway-id"] ?? "") },
							bodyKind: "json",
							body:
								argv.body !== undefined
									? parseBody(argv.body)
									: compactBody({
											alias: resolveFileToken(
												argv["alias"] as string | undefined,
												"alias",
												"text"
											),
											default_config: argv["default-config"],
											provider_slug: resolveFileToken(
												argv["provider-slug"] as string | undefined,
												"provider-slug",
												"text"
											),
											rate_limit: argv["rate-limit"],
											rate_limit_period: argv["rate-limit-period"],
											secret: resolveFileToken(
												argv["secret"] as string | undefined,
												"secret",
												"text"
											),
											secret_id: resolveFileToken(
												argv["secret-id"] as string | undefined,
												"secret-id",
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
					const result = await withProgress(`Creating`, async () =>
						client.aiGateway.gateways.providers.create({
							...bodyData,
							account_id: accountId,
							gateway_id: argv["gateway-id"],
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}
				if (argv["alias"] === undefined) {
					argv["alias"] = await promptForRequiredField(
						"alias",
						"The alias field"
					);
				}
				if (argv["default-config"] === undefined) {
					throw new Error(
						"--default-config is required (or pass --body with this field set)."
					);
				}
				if (argv["provider-slug"] === undefined) {
					argv["provider-slug"] = await promptForRequiredField(
						"provider-slug",
						"The provider_slug field"
					);
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					alias: resolveFileToken(
						argv["alias"] as string | undefined,
						"alias",
						"text"
					),
					default_config: argv["default-config"],
					provider_slug: resolveFileToken(
						argv["provider-slug"] as string | undefined,
						"provider-slug",
						"text"
					),
					rate_limit: argv["rate-limit"],
					rate_limit_period: argv["rate-limit-period"],
					secret: resolveFileToken(
						argv["secret"] as string | undefined,
						"secret",
						"text"
					),
					secret_id: resolveFileToken(
						argv["secret-id"] as string | undefined,
						"secret-id",
						"text"
					),
				});
				const result = await withProgress(`Creating`, async () =>
					client.aiGateway.gateways.providers.create({
						...bodyData,
						account_id: accountId,
						gateway_id: argv["gateway-id"],
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
};

export default command;
