import operation from "../_operations/connector-telemetry-events/get.js";
/**
 * get command
 * @generated from apis/overlays/connector-telemetry-events.ts
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
	command: "get <event-n>",
	describe: "Get Event",
	usage:
		"$0 connector-telemetry-events get <event-n>\n\nGets Magic WAN Connector Telemetry Event",
	flags: {
		"connector-id": { kind: "parsed", brief: "Connector ID", parse: String },
		"event-t": { kind: "parsed", brief: "Event t", parse: String },
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [{ placeholder: "event-n", brief: "Event n", parse: String }],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "connector-telemetry-events get",
				classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
					typeof argv
				>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf connector-telemetry-events get",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/magic/connectors/${argv["connector-id"] == null ? "<connector-id>" : encodeURIComponent(String(argv["connector-id"]))}/telemetry/events/${argv["event-t"] == null ? "<event-t>" : encodeURIComponent(String(argv["event-t"]))}.${argv["event-n"] == null ? "<event-n>" : encodeURIComponent(String(argv["event-n"]))}`,
						pathParams: {
							"connector-id": String(argv["connector-id"] ?? ""),
							"event-t": String(argv["event-t"] ?? ""),
							"event-n": String(argv["event-n"] ?? ""),
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
						event_t: argv["event-t"],
						event_n: argv["event-n"],
					})
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
});

export default command;
