import operation from "../../_operations/network-interconnects/slots/get.js";
/**
 * get command
 * @generated from apis/overlays/network-interconnects.ts
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
	command: "get <slot>",
	describe: "Get information about the specified slot",
	usage:
		"$0 network-interconnects slots get <slot>\n\nGets information about a specific infrastructure slot allocation.",
	flags: {
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [{ placeholder: "slot", brief: "Slot", parse: String }],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "network-interconnects slots get",
				classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
					typeof argv
				>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf network-interconnects slots get",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/cni/slots/${argv["slot"] == null ? "<slot>" : encodeURIComponent(String(argv["slot"]))}`,
						pathParams: { slot: String(argv["slot"] ?? "") },
						bodyKind: "none",
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				const result = await withProgress(`Loading`, async () =>
					client.send(operation, { account_id: accountId, slot: argv["slot"] })
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
});

export default command;
