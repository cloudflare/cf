import operation from "../_operations/connector-telemetry-snapshots/get.js";
/**
 * get command
 * @generated from apis/overlays/connector-telemetry-snapshots.ts
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
	command: "get <snapshot-t>",
	describe: "Get Snapshot",
	usage:
		"$0 connector-telemetry-snapshots get <snapshot-t>\n\nGets Magic WAN Connector Telemetry Snapshot",
	flags: {
		"connector-id": { kind: "parsed", brief: "Connector ID", parse: String },
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [{ placeholder: "snapshot-t", brief: "Snapshot t", parse: String }],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "connector-telemetry-snapshots get",
				classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
					typeof argv
				>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf connector-telemetry-snapshots get",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/magic/connectors/${argv["connector-id"] == null ? "<connector-id>" : encodeURIComponent(String(argv["connector-id"]))}/telemetry/snapshots/${argv["snapshot-t"] == null ? "<snapshot-t>" : encodeURIComponent(String(argv["snapshot-t"]))}`,
						pathParams: {
							"connector-id": String(argv["connector-id"] ?? ""),
							"snapshot-t": String(argv["snapshot-t"] ?? ""),
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
						connector_id: argv["connector-id"],
						snapshot_t: argv["snapshot-t"],
					})
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
});

export default command;
