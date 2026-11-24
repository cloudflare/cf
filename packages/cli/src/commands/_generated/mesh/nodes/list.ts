import operation from "../../_operations/mesh/nodes/list.js";
/**
 * list command
 * @generated from apis/overlays/mesh.ts
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
	describe: "List Mesh nodes",
	usage: "$0 mesh nodes list\n\nLists and filters Mesh nodes in an account.",
	flags: {
		name: {
			kind: "parsed",
			brief: "A user-friendly name for the tunnel.",
			optional: true,
			parse: String,
		},
		"is-deleted": {
			kind: "boolean",
			brief:
				"If `true`, only include deleted tunnels. If `false`, exclude deleted tunnels. If empty, all tunnels will be included.",
			optional: true,
		},
		"existed-at": {
			kind: "parsed",
			brief:
				"If provided, include only resources that were created (and not deleted) before this time. URL encoded.",
			optional: true,
			parse: String,
		},
		uuid: {
			kind: "parsed",
			brief: "UUID of the tunnel.",
			optional: true,
			parse: String,
		},
		"was-active-at": {
			kind: "parsed",
			brief: "Was active at",
			optional: true,
			parse: String,
		},
		"was-inactive-at": {
			kind: "parsed",
			brief: "Was inactive at",
			optional: true,
			parse: String,
		},
		"include-prefix": {
			kind: "parsed",
			brief: "Include prefix",
			optional: true,
			parse: String,
		},
		"exclude-prefix": {
			kind: "parsed",
			brief: "Exclude prefix",
			optional: true,
			parse: String,
		},
		status: {
			kind: "enum",
			brief:
				"The status of the tunnel. Valid values are `inactive` (tunnel has never been run), `degraded` (tunnel is active and able to serve traffic but in an unhealthy state), `healthy` (tunnel is active and able to serve traffic), or `down` (tunnel can not serve traffic as it has no connections to the Cloudflare Edge).",
			values: ["inactive", "degraded", "healthy", "down"],
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
				command: "mesh nodes list",
				classification: {
					safeFlags: ["is-deleted", "status", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
					name: argv["name"],
					is_deleted: argv["is-deleted"],
					existed_at: argv["existed-at"],
					uuid: argv["uuid"],
					was_active_at: argv["was-active-at"],
					was_inactive_at: argv["was-inactive-at"],
					include_prefix: argv["include-prefix"],
					exclude_prefix: argv["exclude-prefix"],
					status: argv["status"],
					per_page: argv["per-page"],
					page: argv["page"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf mesh nodes list",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/warp_connector`,
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
