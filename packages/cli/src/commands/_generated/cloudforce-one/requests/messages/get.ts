import operation from "../../../_operations/cloudforce-one/requests/messages/get.js";
/**
 * get command
 * @generated from apis/overlays/cloudforce-one.ts
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
	command: "get <message-id>",
	describe: "Read a single message for an RFI request",
	usage:
		"$0 cloudforce-one requests messages get <message-id>\n\nReturns the details for a specific message belonging to an RFI request.",
	flags: {
		"project-type": { kind: "parsed", brief: "Project type", parse: String },
		"request-id": { kind: "parsed", brief: "Request ID", parse: String },
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [{ placeholder: "message-id", brief: "Message ID", parse: String }],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "cloudforce-one requests messages get",
				classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
					typeof argv
				>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf cloudforce-one requests messages get",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/cloudforce-one/v2/requests/${argv["project-type"] == null ? "<project-type>" : encodeURIComponent(String(argv["project-type"]))}/${argv["request-id"] == null ? "<request-id>" : encodeURIComponent(String(argv["request-id"]))}/messages/${argv["message-id"] == null ? "<message-id>" : encodeURIComponent(String(argv["message-id"]))}`,
						pathParams: {
							"project-type": String(argv["project-type"] ?? ""),
							"request-id": String(argv["request-id"] ?? ""),
							"message-id": String(argv["message-id"] ?? ""),
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
						project_type: argv["project-type"],
						request_id: argv["request-id"],
						message_id: argv["message-id"],
					})
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
});

export default command;
