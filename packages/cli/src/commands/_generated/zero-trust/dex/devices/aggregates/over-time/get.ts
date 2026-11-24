import operation from "../../../../../_operations/zero-trust/dex/devices/aggregates/over-time/get.js";
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
	command: "get",
	describe: "Get over time aggregate details for devices by dimension",
	usage:
		"$0 zero-trust dex devices aggregates over-time get\n\nGet aggregate details for devices using WARP, up to 7 days.",
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
				command: "zero-trust dex devices aggregates over-time get",
				classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
					typeof argv
				>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
					to: argv["to"],
					from: argv["from"],
					colo: argv["colo"],
					device_id: argv["device-id"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf zero-trust dex devices aggregates over-time get",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/dex/fleet-status/over-time`,
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
