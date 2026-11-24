import operation from "../../../../_operations/zero-trust/access/users/active-sessions/get.js";
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
	command: "get <nonce>",
	describe: "Get single active session",
	usage:
		"$0 zero-trust access users active-sessions get <nonce>\n\nGet an active session for a single user.",
	flags: {
		"user-id": { kind: "parsed", brief: "UUID.", parse: String },
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [{ placeholder: "nonce", brief: "Nonce", parse: String }],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "zero-trust access users active-sessions get",
				classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
					typeof argv
				>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf zero-trust access users active-sessions get",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/access/users/${argv["user-id"] == null ? "<user-id>" : encodeURIComponent(String(argv["user-id"]))}/active_sessions/${argv["nonce"] == null ? "<nonce>" : encodeURIComponent(String(argv["nonce"]))}`,
						pathParams: {
							"user-id": String(argv["user-id"] ?? ""),
							nonce: String(argv["nonce"] ?? ""),
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
						user_id: argv["user-id"],
						nonce: argv["nonce"],
					})
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
});

export default command;
