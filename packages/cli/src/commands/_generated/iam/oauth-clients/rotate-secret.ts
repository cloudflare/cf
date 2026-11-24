import operation from "../../_operations/iam/oauth-clients/rotate-secret.js";
/**
 * rotate-secret command
 * @generated from apis/overlays/iam.ts
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
	command: "rotate-secret <oauth-client-id>",
	describe: "Rotate OAuth Client Secret",
	usage:
		"$0 iam oauth-clients rotate-secret <oauth-client-id>\n\nCreates a second client secret so you can update your client configuration before deleting the old one. The `has_rotated_secret` field on the client will be set to `true`.",
	flags: {
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [
		{
			placeholder: "oauth-client-id",
			brief: "The unique identifier for an OAuth client.",
			parse: String,
		},
	],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "iam oauth-clients rotate-secret",
				classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
					typeof argv
				>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf iam oauth-clients rotate-secret",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/oauth_clients/${argv["oauth-client-id"] == null ? "<oauth-client-id>" : encodeURIComponent(String(argv["oauth-client-id"]))}/rotate_secret`,
						pathParams: {
							"oauth-client-id": String(argv["oauth-client-id"] ?? ""),
						},
						bodyKind: "none",
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				const result = await withProgress(`Creating`, async () =>
					client.send(operation, {
						account_id: accountId,
						oauth_client_id: argv["oauth-client-id"],
					})
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
});

export default command;
