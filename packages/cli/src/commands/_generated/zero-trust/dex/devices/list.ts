import operation from "../../../_operations/zero-trust/dex/devices/list.js";
/**
 * list command
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
	command: "list",
	describe: "List details of devices using WARP.",
	usage:
		"$0 zero-trust dex devices list\n\nList details of devices using WARP.",
	flags: {
		to: {
			kind: "parsed",
			brief:
				"End of the time range to query. Timestamp can be provided in ISO 8601 datetime format or milliseconds since epoch.",
			parse: String,
		},
		from: {
			kind: "parsed",
			brief:
				"Start of the time range to query. Timestamp can be provided in ISO 8601 datetime format or milliseconds since epoch.",
			parse: String,
		},
		page: {
			kind: "parsed",
			brief: "Page number of paginated results.",
			parse: Number,
		},
		"per-page": {
			kind: "parsed",
			brief: "Number of results per page.",
			parse: Number,
		},
		"sort-by": {
			kind: "enum",
			brief: "Dimension to sort results by.",
			values: [
				"colo",
				"device_id",
				"mode",
				"platform",
				"status",
				"timestamp",
				"version",
			],
			optional: true,
		},
		colo: {
			kind: "parsed",
			brief: "Cloudflare colo airport code.",
			optional: true,
			parse: String,
		},
		"device-id": {
			kind: "parsed",
			brief: "Device-specific ID, given as UUID.",
			optional: true,
			parse: String,
		},
		"device-mode": {
			kind: "parsed",
			brief: "The mode under which the WARP client is run.",
			optional: true,
			parse: String,
		},
		status: {
			kind: "parsed",
			brief: "Network status.",
			optional: true,
			parse: String,
		},
		platform: {
			kind: "parsed",
			brief: "Operating system.",
			optional: true,
			parse: String,
		},
		"warp-version": {
			kind: "parsed",
			brief: "WARP client version.",
			optional: true,
			parse: String,
		},
		source: {
			kind: "enum",
			brief:
				"Source:\n  * `hourly` - device details aggregated hourly, up to 7 days prior\n  * `last_seen` - device details, up to 60 minutes prior. Time windows exceeding 60 minutes will be rejected from June 1st, 2026. Please use 'hourly' or 'raw' instead for longer time ranges.\n  * `raw` - device details, up to 7 days prior",
			values: ["last_seen", "hourly", "raw"],
			optional: true,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "zero-trust dex devices list",
				classification: {
					safeFlags: ["sort-by", "source", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
					to: argv["to"],
					from: argv["from"],
					page: argv["page"],
					per_page: argv["per-page"],
					sort_by: argv["sort-by"],
					colo: argv["colo"],
					device_id: argv["device-id"],
					mode: argv["device-mode"],
					status: argv["status"],
					platform: argv["platform"],
					version: argv["warp-version"],
					source: argv["source"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf zero-trust dex devices list",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/dex/fleet-status/devices`,
						pathParams: {},
						query: queryParams,
						bodyKind: "none",
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				const result = await withProgress(`Loading`, async () =>
					client.send(operation, { account_id: accountId, ...queryParams })
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
});

export default command;
