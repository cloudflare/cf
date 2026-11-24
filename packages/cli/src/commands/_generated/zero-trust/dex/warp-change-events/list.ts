import operation from "../../../_operations/zero-trust/dex/warp-change-events/list.js";
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
	describe: "List WARP change events.",
	usage:
		"$0 zero-trust dex warp-change-events list\n\nList WARP configuration and enablement toggle change events by device.",
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
			parse: String,
		},
		to: {
			kind: "parsed",
			brief: "End time for the query in ISO (RFC3339 - ISO 8601) format.",
			parse: String,
		},
		type: {
			kind: "enum",
			brief: "Filter events by type 'config' or 'toggle'.",
			values: ["config", "toggle"],
			optional: true,
		},
		toggle: {
			kind: "enum",
			brief:
				"Filter events by type toggle value. Applicable to type='toggle' events only.",
			values: ["on", "off"],
			optional: true,
		},
		"config-name": {
			kind: "parsed",
			brief:
				"Filter events by WARP configuration name changed from or to. Applicable to type='config' events only.",
			optional: true,
			parse: String,
		},
		"account-name": {
			kind: "parsed",
			brief: "Filter events by account name.",
			optional: true,
			parse: String,
		},
		"sort-order": {
			kind: "enum",
			brief: "Sort response by event timestamp.",
			values: ["ASC", "DESC"],
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
				command: "zero-trust dex warp-change-events list",
				classification: {
					safeFlags: ["type", "toggle", "sort-order", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
					page: argv["page"],
					per_page: argv["per-page"],
					from: argv["from"],
					to: argv["to"],
					type: argv["type"],
					toggle: argv["toggle"],
					config_name: argv["config-name"],
					account_name: argv["account-name"],
					sort_order: argv["sort-order"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf zero-trust dex warp-change-events list",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/dex/warp-change-events`,
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
