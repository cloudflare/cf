import operation from "../../_operations/network/subnets/list.js";
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
	describe: "List Subnets",
	usage: "$0 network subnets list\n\nLists and filters subnets in an account.",
	flags: {
		name: {
			kind: "parsed",
			brief: "If set, only list subnets with the given name",
			optional: true,
			parse: String,
		},
		comment: {
			kind: "parsed",
			brief: "If set, only list subnets with the given comment.",
			optional: true,
			parse: String,
		},
		network: {
			kind: "parsed",
			brief:
				"If set, only list the subnet whose network exactly matches the given CIDR.",
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
		"address-family": {
			kind: "enum",
			brief:
				"If set, only include subnets in the given address family - `v4` or `v6`",
			values: ["v4", "v6"],
			optional: true,
		},
		"is-default-network": {
			kind: "boolean",
			brief:
				"If `true`, only include default subnets. If `false`, exclude default subnets subnets. If not set, all subnets will be included.",
			optional: true,
		},
		"is-deleted": {
			kind: "boolean",
			brief:
				"If `true`, only include deleted subnets. If `false`, exclude deleted subnets. If not set, all subnets will be included.",
			optional: true,
		},
		"sort-order": {
			kind: "enum",
			brief:
				"Sort order of the results. `asc` means oldest to newest, `desc` means newest to oldest. If not set, they will not be in any particular order.",
			values: ["asc", "desc"],
			optional: true,
		},
		"subnet-types": {
			kind: "enum",
			brief: "If set, the types of subnets to include, separated by comma.",
			values: ["cloudflare_source", "initial_resolved_ip", "warp"],
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
				command: "network subnets list",
				classification: {
					safeFlags: [
						"address-family",
						"is-default-network",
						"is-deleted",
						"sort-order",
						"subnet-types",
						"dry-run",
					],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
					name: argv["name"],
					comment: argv["comment"],
					network: argv["network"],
					existed_at: argv["existed-at"],
					address_family: argv["address-family"],
					is_default_network: argv["is-default-network"],
					is_deleted: argv["is-deleted"],
					sort_order: argv["sort-order"],
					subnet_types: argv["subnet-types"],
					per_page: argv["per-page"],
					page: argv["page"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf network subnets list",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/zerotrust/subnets`,
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
