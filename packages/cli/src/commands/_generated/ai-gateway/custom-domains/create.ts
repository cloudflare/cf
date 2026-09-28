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
			"$0 ai-gateway custom-domains create <gateway-id>\n\nProvisions a Cloudflare-for-SaaS custom hostname and returns the CNAME target to point DNS at."
		)
		.positional("gateway-id", {
			type: "string",
			description: "Unique identifier of the AI Gateway within the account.",
			demandOption: true,
		})
		.option("domain", {
			type: "string",
			description: "Custom hostname that you own, such as `ai.example.com`.",
		})
		.option("min-tls", {
			type: "string",
			description: "The minTLS field",
			choices: ["1.0", "1.1", "1.2", "1.3"],
		})
		.option("zone-id", {
			type: "string",
			description:
				"ID of the Cloudflare zone that contains the custom hostname.",
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

type Request = SdkRequest<"aig-config-create-custom-domain">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "create <gateway-id>",
	describe: "Create a custom domain for a gateway",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "ai-gateway custom-domains create",
				classification: {
					safeFlags: ["min-tls", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf ai-gateway custom-domains create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/ai-gateway/gateways/${argv["gateway-id"] == null ? "<gateway-id>" : encodeURIComponent(String(argv["gateway-id"]))}/custom-domains`,
						pathParams: { "gateway-id": String(argv["gateway-id"] ?? "") },
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										domain: resolveFileToken(
											argv["domain"] as string | undefined,
											"domain",
											"text"
										),
										minTLS: resolveFileToken(
											argv["min-tls"] as string | undefined,
											"min-tls",
											"text"
										),
										zone_id: resolveFileToken(
											argv["zone-id"] as string | undefined,
											"zone-id",
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
						client.aiGateway.customDomains.create({
							...bodyData,
							account_id: accountId,
							gateway_id: argv["gateway-id"],
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}
				if (argv["domain"] === undefined) {
					argv["domain"] = await promptForRequiredField(
						"domain",
						"Custom hostname that you own, such as \`ai.example.com\`."
					);
				}
				if (argv["zone-id"] === undefined) {
					argv["zone-id"] = await promptForRequiredField(
						"zone-id",
						"ID of the Cloudflare zone that contains the custom hostname."
					);
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					domain: resolveFileToken(
						argv["domain"] as string | undefined,
						"domain",
						"text"
					),
					minTLS: resolveFileToken(
						argv["min-tls"] as string | undefined,
						"min-tls",
						"text"
					),
					zone_id: resolveFileToken(
						argv["zone-id"] as string | undefined,
						"zone-id",
						"text"
					),
				});
				const result = await withProgress(`Creating`, async () =>
					client.aiGateway.customDomains.create({
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
