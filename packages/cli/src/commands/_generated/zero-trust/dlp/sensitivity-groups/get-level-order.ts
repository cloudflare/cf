import operation from "../../../_operations/zero-trust/dlp/sensitivity-groups/get-level-order.js";
/**
 * get-level-order command
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
	command: "get-level-order <sensitivity-group-id>",
	describe: "Retrieve the ordered list of level IDs for a sensitivity group.",
	usage:
		"$0 zero-trust dlp sensitivity-groups get-level-order <sensitivity-group-id>\n\nGets the current order of sensitivity levels in a group.",
	flags: {
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [
		{
			placeholder: "sensitivity-group-id",
			brief: "Sensitivity group ID",
			parse: String,
		},
	],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "zero-trust dlp sensitivity-groups get-level-order",
				classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
					typeof argv
				>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf zero-trust dlp sensitivity-groups get-level-order",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/dlp/sensitivity_groups/${argv["sensitivity-group-id"] == null ? "<sensitivity-group-id>" : encodeURIComponent(String(argv["sensitivity-group-id"]))}/level_order`,
						pathParams: {
							"sensitivity-group-id": String(
								argv["sensitivity-group-id"] ?? ""
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
					})
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
});

export default command;
