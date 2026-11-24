import operation from "../../_operations/network/virtual-networks/list.js";
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
	describe: "List virtual networks",
	usage:
		"$0 network virtual-networks list\n\nLists and filters virtual networks in an account.",
	flags: {
		page: {
			kind: "parsed",
			brief: "Page number of paginated results, starting at 1. Defaults to 1.",
			optional: true,
			parse: Number,
		},
		"per-page": {
			kind: "parsed",
			brief:
				"Number of virtual networks per page, up to 1000. Defaults to 1000.",
			optional: true,
			parse: Number,
		},
		id: {
			kind: "parsed",
			brief: "UUID of the virtual network.",
			optional: true,
			parse: String,
		},
		name: {
			kind: "parsed",
			brief: "A user-friendly name for the virtual network.",
			optional: true,
			parse: String,
		},
		"is-default": {
			kind: "boolean",
			brief:
				"If `true`, only include the default virtual network. If `false`, exclude the default virtual network. If empty, all virtual networks will be included.",
			optional: true,
		},
		"is-default-network": {
			kind: "boolean",
			brief:
				"If `true`, only include the default virtual network. If `false`, exclude the default virtual network. If empty, all virtual networks will be included.",
			optional: true,
		},
		"is-deleted": {
			kind: "boolean",
			brief:
				"If `true`, only include deleted virtual networks. If `false`, exclude deleted virtual networks. If empty, all virtual networks will be included.",
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
				command: "network virtual-networks list",
				classification: {
					safeFlags: [
						"is-default",
						"is-default-network",
						"is-deleted",
						"dry-run",
					],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
					page: argv["page"],
					per_page: argv["per-page"],
					id: argv["id"],
					name: argv["name"],
					is_default: argv["is-default"],
					is_default_network: argv["is-default-network"],
					is_deleted: argv["is-deleted"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf network virtual-networks list",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/teamnet/virtual_networks`,
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
