import operation from "../../../../_operations/zero-trust/identity-providers/scim/users/get.js";
/**
 * get command
 * @generated from apis/overlays/zero-trust.ts
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
	command: "get <user-id>",
	describe: "Get a SCIM User resource",
	usage:
		"$0 zero-trust identity-providers scim users get <user-id>\n\nReturns a SCIM User resource synced to Cloudflare via the System for Cross-domain Identity Management (SCIM).",
	flags: {
		"identity-provider-id": { kind: "parsed", brief: "UUID.", parse: String },
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [{ placeholder: "user-id", brief: "Identifier.", parse: String }],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "zero-trust identity-providers scim users get",
				classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
					typeof argv
				>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf zero-trust identity-providers scim users get",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/access/identity_providers/${argv["identity-provider-id"] == null ? "<identity-provider-id>" : encodeURIComponent(String(argv["identity-provider-id"]))}/scim/users/${argv["user-id"] == null ? "<user-id>" : encodeURIComponent(String(argv["user-id"]))}`,
						pathParams: {
							"identity-provider-id": String(
								argv["identity-provider-id"] ?? ""
							),
							"user-id": String(argv["user-id"] ?? ""),
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
						identity_provider_id: argv["identity-provider-id"],
						user_id: argv["user-id"],
					})
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
});

export default command;
