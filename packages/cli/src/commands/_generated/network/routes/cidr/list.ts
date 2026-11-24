import operation from "../../../_operations/network/routes/cidr/list.js";
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
	describe: "List tunnel routes",
	usage:
		"$0 network routes cidr list\n\nLists and filters private network routes in an account.",
	flags: {
		comment: {
			kind: "parsed",
			brief: "Optional remark describing the route.",
			optional: true,
			parse: String,
		},
		"is-deleted": {
			kind: "boolean",
			brief:
				"If `true`, only include deleted routes. If `false`, exclude deleted routes. If empty, all routes will be included.",
			optional: true,
		},
		"network-subset": {
			kind: "parsed",
			brief:
				"If set, only list routes that are contained within this IP range.",
			optional: true,
			parse: String,
		},
		"network-superset": {
			kind: "parsed",
			brief: "If set, only list routes that contain this IP range.",
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
		"tunnel-id": {
			kind: "parsed",
			brief: "UUID of the tunnel.",
			optional: true,
			parse: String,
		},
		"route-id": {
			kind: "parsed",
			brief: "UUID of the route.",
			optional: true,
			parse: String,
		},
		"tun-types": {
			kind: "parsed",
			brief: "The types of tunnels to filter by, separated by commas.",
			variadic: true,
			optional: true,
			choices: [
				"cfd_tunnel",
				"warp_connector",
				"warp",
				"magic",
				"ip_sec",
				"gre",
				"cni",
			],
			parse: String,
			coerce: (values: string[]) => values.flatMap((value) => value.split(",")),
		},
		"virtual-network-id": {
			kind: "parsed",
			brief: "UUID of the virtual network.",
			optional: true,
			parse: String,
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
				command: "network routes cidr list",
				classification: {
					safeFlags: ["is-deleted", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
					comment: argv["comment"],
					is_deleted: argv["is-deleted"],
					network_subset: argv["network-subset"],
					network_superset: argv["network-superset"],
					existed_at: argv["existed-at"],
					tunnel_id: argv["tunnel-id"],
					route_id: argv["route-id"],
					tun_types: argv["tun-types"],
					virtual_network_id: argv["virtual-network-id"],
					per_page: argv["per-page"],
					page: argv["page"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf network routes cidr list",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/teamnet/routes`,
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
