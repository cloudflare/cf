import operation from "../../../_operations/zero-trust/dex/devices/get.js";
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
	command: "get <device-id>",
	describe: "Get the latest status of a device.",
	usage:
		"$0 zero-trust dex devices get <device-id>\n\nGet the latest status of a device given device_id from the device_state table.",
	flags: {
		"since-minutes": {
			kind: "parsed",
			brief: "Number of minutes before current time.",
			parse: Number,
		},
		"time-now": {
			kind: "parsed",
			brief: "Current time in ISO format.",
			optional: true,
			parse: String,
		},
		colo: {
			kind: "parsed",
			brief: "List of data centers to filter results.",
			optional: true,
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
			placeholder: "device-id",
			brief: "Device-specific ID, given as UUID.",
			parse: String,
		},
	],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "zero-trust dex devices get",
				classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
					typeof argv
				>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
					since_minutes: argv["since-minutes"],
					time_now: argv["time-now"],
					colo: argv["colo"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf zero-trust dex devices get",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/dex/devices/${argv["device-id"] == null ? "<device-id>" : encodeURIComponent(String(argv["device-id"]))}/fleet-status/live`,
						pathParams: { "device-id": String(argv["device-id"] ?? "") },
						query: queryParams,
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
						device_id: argv["device-id"],
						...queryParams,
					})
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
});

export default command;
