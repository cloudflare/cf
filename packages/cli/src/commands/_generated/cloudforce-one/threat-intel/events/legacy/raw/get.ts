import operation from "../../../../../_operations/cloudforce-one/threat-intel/events/legacy/raw/get.js";
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
	command: "get <raw-id>",
	describe: "Get raw event data by raw ID (legacy)",
	usage:
		"$0 cloudforce-one threat-intel events legacy raw get <raw-id>\n\nLegacy. Returns raw data stored under a `raw_id`, which new events don't use. Use `threat-intel events raw get` (`GET /events/datasets/{dataset_id}/events/{event_id}/raw`) instead.",
	flags: {
		"event-id": { kind: "parsed", brief: "Event UUID.", parse: String },
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [
		{ placeholder: "raw-id", brief: "Raw Event UUID.", parse: String },
	],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "cloudforce-one threat-intel events legacy raw get",
				classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
					typeof argv
				>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf cloudforce-one threat-intel events legacy raw get",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/cloudforce-one/events/${argv["event-id"] == null ? "<event-id>" : encodeURIComponent(String(argv["event-id"]))}/raw/${argv["raw-id"] == null ? "<raw-id>" : encodeURIComponent(String(argv["raw-id"]))}`,
						pathParams: {
							"event-id": String(argv["event-id"] ?? ""),
							"raw-id": String(argv["raw-id"] ?? ""),
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
						event_id: argv["event-id"],
						raw_id: argv["raw-id"],
					})
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
});

export default command;
