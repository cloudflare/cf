import operation from "../../../_operations/zero-trust/dex/commands/list.js";
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
	describe: "List account commands",
	usage:
		"$0 zero-trust dex commands list\n\nRetrieves a paginated list of commands issued to devices under the specified account, optionally filtered by time range, device, or other parameters",
	flags: {
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
		from: {
			kind: "parsed",
			brief: "Start time for the query in ISO (RFC3339 - ISO 8601) format.",
			optional: true,
			parse: String,
		},
		to: {
			kind: "parsed",
			brief: "End time for the query in ISO (RFC3339 - ISO 8601) format.",
			optional: true,
			parse: String,
		},
		"device-id": {
			kind: "parsed",
			brief: "Unique identifier for a device.",
			optional: true,
			parse: String,
		},
		"user-email": {
			kind: "parsed",
			brief: "Email tied to the device.",
			optional: true,
			parse: String,
		},
		"command-type": {
			kind: "enum",
			brief: "Optionally filter executed commands by command type.",
			values: ["pcap", "speed-test", "warp-diag"],
			optional: true,
		},
		status: {
			kind: "enum",
			brief: "Optionally filter executed commands by status.",
			values: ["PENDING_EXEC", "PENDING_UPLOAD", "SUCCESS", "FAILED"],
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
				command: "zero-trust dex commands list",
				classification: {
					safeFlags: ["command-type", "status", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
					page: argv["page"],
					per_page: argv["per-page"],
					from: argv["from"],
					to: argv["to"],
					device_id: argv["device-id"],
					user_email: argv["user-email"],
					command_type: argv["command-type"],
					status: argv["status"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf zero-trust dex commands list",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/dex/commands`,
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
