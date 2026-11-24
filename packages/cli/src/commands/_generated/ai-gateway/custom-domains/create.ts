import operation from "../../_operations/ai-gateway/custom-domains/create.js";
/**
 * create command
 * @generated from apis/overlays/ai-gateway.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
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

const command = apiCommand({
	command: "create <gateway-id>",
	describe: "Create a custom domain for a gateway",
	usage:
		"$0 ai-gateway custom-domains create <gateway-id>\n\nProvisions a Cloudflare-for-SaaS custom hostname and returns the CNAME target to point DNS at.",
	flags: {
		domain: {
			kind: "parsed",
			brief: "Custom hostname that you own, such as `ai.example.com`.",
			optional: true,
			parse: String,
		},
		"min-tls": {
			kind: "parsed",
			brief: "The minTLS field",
			optional: true,
			choices: ["1.0", "1.1", "1.2", "1.3"],
			parse: String,
			coerce: (value: string) => resolveFileToken(value, "min-tls", "text"),
		},
		"zone-id": {
			kind: "parsed",
			brief: "ID of the Cloudflare zone that contains the custom hostname.",
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
			placeholder: "gateway-id",
			brief: "Unique identifier of the AI Gateway within the account.",
			parse: String,
		},
	],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "ai-gateway custom-domains create",
				classification: {
					safeFlags: ["min-tls", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const resolveRequiredFields = async (): Promise<void> => {
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
				};
				if (argv.dryRun) {
					if (argv.body === undefined) {
						await resolveRequiredFields();
					}
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
										minTLS: argv["min-tls"],
										zone_id: resolveFileToken(
											argv["zone-id"] as string | undefined,
											"zone-id",
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
							gateway_id: argv["gateway-id"],
						})
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}
				await resolveRequiredFields();

				// Assemble request body from individual flags
				const bodyData = compactBody({
					domain: resolveFileToken(
						argv["domain"] as string | undefined,
						"domain",
						"text"
					),
					minTLS: argv["min-tls"],
					zone_id: resolveFileToken(
						argv["zone-id"] as string | undefined,
						"zone-id",
						"text"
					),
				});
				const result = await withProgress(`Creating`, async () =>
					client.send(operation, {
						body: bodyData,
						account_id: accountId,
						gateway_id: argv["gateway-id"],
					})
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
});

export default command;
