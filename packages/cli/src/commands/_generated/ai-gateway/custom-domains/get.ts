import operation from "../../_operations/ai-gateway/custom-domains/get.js";
/**
 * get command
 * @generated from apis/overlays/ai-gateway.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
import {
	createCommandClient,
	getAccountId,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { formatDryRun } from "#lib/dry-run.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "get <hostname>",
	describe: "Get a custom domain",
	usage:
		"$0 ai-gateway custom-domains get <hostname>\n\nRetrieves a custom domain attached to an AI Gateway, including its status and CNAME target.",
	flags: {
		"gateway-id": {
			kind: "parsed",
			brief: "Unique identifier of the AI Gateway within the account.",
			parse: String,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [
		{
			placeholder: "hostname",
			brief: "Custom hostname that you own, such as \`ai.example.com\`.",
			parse: String,
		},
	],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "ai-gateway custom-domains get",
				classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
					typeof argv
				>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf ai-gateway custom-domains get",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/ai-gateway/gateways/${argv["gateway-id"] == null ? "<gateway-id>" : encodeURIComponent(String(argv["gateway-id"]))}/custom-domains/${argv["hostname"] == null ? "<hostname>" : encodeURIComponent(String(argv["hostname"]))}`,
						pathParams: {
							"gateway-id": String(argv["gateway-id"] ?? ""),
							hostname: String(argv["hostname"] ?? ""),
						},
						bodyKind: "none",
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				const result = await withProgress(`Loading`, async () =>
					client.send(operation, {
						account_id: accountId,
						gateway_id: argv["gateway-id"],
						hostname: argv["hostname"],
					})
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
});

export default command;
