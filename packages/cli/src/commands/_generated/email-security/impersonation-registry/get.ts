import operation from "../../_operations/email-security/impersonation-registry/get.js";
/**
 * get command
 * @generated from apis/overlays/email-security.ts
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
	command: "get <impersonation-registry-id>",
	describe: "Get an impersonation registry entry",
	usage:
		"$0 email-security impersonation-registry get <impersonation-registry-id>\n\nRetrieves details for a specific impersonation registry entry including the protected identity, email pattern, and synchronization source if directory-synced.",
	flags: {
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [
		{
			placeholder: "impersonation-registry-id",
			brief: "Impersonation registry entry identifier.",
			parse: String,
		},
	],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "email-security impersonation-registry get",
				classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
					typeof argv
				>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf email-security impersonation-registry get",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/email-security/settings/impersonation_registry/${argv["impersonation-registry-id"] == null ? "<impersonation-registry-id>" : encodeURIComponent(String(argv["impersonation-registry-id"]))}`,
						pathParams: {
							"impersonation-registry-id": String(
								argv["impersonation-registry-id"] ?? ""
							),
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
						impersonation_registry_id: argv["impersonation-registry-id"],
					})
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
});

export default command;
