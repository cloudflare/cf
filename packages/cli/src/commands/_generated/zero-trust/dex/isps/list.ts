import operation from "../../../_operations/zero-trust/dex/isps/list.js";
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
	describe: "List device ISPs",
	usage:
		"$0 zero-trust dex isps list\n\nList ISP information observed for a specific device during traceroute tests.",
	flags: {
		"device-id": {
			kind: "parsed",
			brief: "Device-specific ID, given as UUID.",
			parse: String,
		},
		page: {
			kind: "parsed",
			brief:
				"Page number of paginated results. Mutually exclusive with cursor.",
			optional: true,
			parse: Number,
		},
		"per-page": {
			kind: "parsed",
			brief: "Number of items per page",
			parse: Number,
		},
		cursor: {
			kind: "parsed",
			brief:
				"Cursor for cursor-based pagination. Mutually exclusive with page.",
			optional: true,
			parse: String,
		},
		"sort-by": {
			kind: "enum",
			brief: "The field to sort results by.",
			values: ["time_start"],
			optional: true,
		},
		"sort-order": {
			kind: "enum",
			brief: "The order to sort results.",
			values: ["ASC", "DESC"],
			optional: true,
		},
		from: {
			kind: "parsed",
			brief: "Start time for the query in ISO 8601 format.",
			optional: true,
			parse: String,
		},
		to: {
			kind: "parsed",
			brief: "End time for the query in ISO 8601 format.",
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
				command: "zero-trust dex isps list",
				classification: {
					safeFlags: ["sort-by", "sort-order", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
					page: argv["page"],
					per_page: argv["per-page"],
					cursor: argv["cursor"],
					sort_by: argv["sort-by"],
					sort_order: argv["sort-order"],
					from: argv["from"],
					to: argv["to"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf zero-trust dex isps list",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/dex/devices/${argv["device-id"] == null ? "<device-id>" : encodeURIComponent(String(argv["device-id"]))}/isps`,
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
