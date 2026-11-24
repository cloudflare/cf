import operation from "../../../../_operations/zero-trust/dex/devices/over-time/get.js";
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
	describe: "Get the status over time for a device",
	usage:
		"$0 zero-trust dex devices over-time get <device-id>\n\nGet time-bucketed status metrics for a specific device.",
	flags: {
		from: {
			kind: "parsed",
			brief:
				"Start of the time range to query. Timestamp can be provided in ISO 8601 datetime format or milliseconds since epoch.",
			parse: String,
		},
		to: {
			kind: "parsed",
			brief:
				"End of the time range to query. Timestamp can be provided in ISO 8601 datetime format or milliseconds since epoch.",
			parse: String,
		},
		interval: {
			kind: "enum",
			brief: "Time interval for aggregate time slots.",
			values: ["minute", "hour"],
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
				command: "zero-trust dex devices over-time get",
				classification: {
					safeFlags: ["interval", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
					from: argv["from"],
					to: argv["to"],
					interval: argv["interval"],
					colo: argv["colo"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf zero-trust dex devices over-time get",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/dex/devices/${argv["device-id"] == null ? "<device-id>" : encodeURIComponent(String(argv["device-id"]))}/fleet-status/over-time`,
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
