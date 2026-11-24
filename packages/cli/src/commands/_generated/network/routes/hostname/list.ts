import operation from "../../../_operations/network/routes/hostname/list.js";
/**
 * list command
 * @generated from apis/overlays/network.ts
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
	describe: "List hostname routes",
	usage:
		"$0 network routes hostname list\n\nLists and filters hostname routes in an account.",
	flags: {
		id: {
			kind: "parsed",
			brief: "The hostname route ID.",
			optional: true,
			parse: String,
		},
		hostname: {
			kind: "parsed",
			brief:
				"If set, only list hostname routes that contain a substring of the given value, the filter is case-insensitive.",
			optional: true,
			parse: String,
		},
		"tunnel-id": {
			kind: "parsed",
			brief:
				"If set, only list hostname routes that point to a specific tunnel.",
			optional: true,
			parse: String,
		},
		comment: {
			kind: "parsed",
			brief: "If set, only list hostname routes with the given comment.",
			optional: true,
			parse: String,
		},
		"existed-at": {
			kind: "parsed",
			brief:
				"If provided, include only resources that were created (and not deleted) before this time. URL encoded.",
			optional: true,
			parse: String,
		},
		"is-deleted": {
			kind: "boolean",
			brief:
				"If `true`, only return deleted hostname routes. If `false`, exclude deleted hostname routes.",
			optional: true,
		},
		"per-page": {
			kind: "parsed",
			brief: "Number of results to display.",
			optional: true,
			parse: Number,
		},
		page: {
			kind: "parsed",
			brief: "Page number of paginated results.",
			optional: true,
			parse: Number,
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
				command: "network routes hostname list",
				classification: {
					safeFlags: ["is-deleted", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
					id: argv["id"],
					hostname: argv["hostname"],
					tunnel_id: argv["tunnel-id"],
					comment: argv["comment"],
					existed_at: argv["existed-at"],
					is_deleted: argv["is-deleted"],
					per_page: argv["per-page"],
					page: argv["page"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf network routes hostname list",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/zerotrust/routes/hostname`,
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
