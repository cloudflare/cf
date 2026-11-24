import operation from "../../_operations/resource-sharing/excluded-recipients/get.js";
/**
 * get command
 * @generated from apis/overlays/resource-sharing.ts
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
	command: "get <excluded-recipient-id>",
	describe: "Get share excluded recipient by ID",
	usage:
		"$0 resource-sharing excluded-recipients get <excluded-recipient-id>\n\nGets a single excluded recipient of a share by its identifier tag.",
	flags: {
		"share-id": {
			kind: "parsed",
			brief: "Share identifier tag.",
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
			placeholder: "excluded-recipient-id",
			brief: "Share Excluded Recipient identifier tag.",
			parse: String,
		},
	],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "resource-sharing excluded-recipients get",
				classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
					typeof argv
				>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf resource-sharing excluded-recipients get",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/shares/${argv["share-id"] == null ? "<share-id>" : encodeURIComponent(String(argv["share-id"]))}/excluded-recipients/${argv["excluded-recipient-id"] == null ? "<excluded-recipient-id>" : encodeURIComponent(String(argv["excluded-recipient-id"]))}`,
						pathParams: {
							"share-id": String(argv["share-id"] ?? ""),
							"excluded-recipient-id": String(
								argv["excluded-recipient-id"] ?? ""
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
						share_id: argv["share-id"],
						excluded_recipient_id: argv["excluded-recipient-id"],
					})
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
});

export default command;
