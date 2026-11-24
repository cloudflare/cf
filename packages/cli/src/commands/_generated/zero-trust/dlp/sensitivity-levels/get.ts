import operation from "../../../_operations/zero-trust/dlp/sensitivity-levels/get.js";
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
	command: "get <sensitivity-level-id>",
	describe: "Retrieve a specific sensitivity level.",
	usage:
		"$0 zero-trust dlp sensitivity-levels get <sensitivity-level-id>\n\nGets a sensitivity level from a group.",
	flags: {
		"sensitivity-group-id": {
			kind: "parsed",
			brief: "Sensitivity group ID",
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
			placeholder: "sensitivity-level-id",
			brief: "Sensitivity level ID",
			parse: String,
		},
	],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "zero-trust dlp sensitivity-levels get",
				classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
					typeof argv
				>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf zero-trust dlp sensitivity-levels get",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/dlp/sensitivity_groups/${argv["sensitivity-group-id"] == null ? "<sensitivity-group-id>" : encodeURIComponent(String(argv["sensitivity-group-id"]))}/levels/${argv["sensitivity-level-id"] == null ? "<sensitivity-level-id>" : encodeURIComponent(String(argv["sensitivity-level-id"]))}`,
						pathParams: {
							"sensitivity-group-id": String(
								argv["sensitivity-group-id"] ?? ""
							),
							"sensitivity-level-id": String(
								argv["sensitivity-level-id"] ?? ""
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
						sensitivity_group_id: argv["sensitivity-group-id"],
						sensitivity_level_id: argv["sensitivity-level-id"],
					})
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
});

export default command;
