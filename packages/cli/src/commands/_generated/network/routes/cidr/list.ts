import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkQuery, SdkRequest } from "#sdk";
/**
 * list command
 * @generated from apis/overlays/network.ts
 */
import type { Argv, CommandModule } from "yargs";
import {
	createCommandClient,
	getAccountId,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { withArgTypes } from "#lib/cli-types.js";
import { formatDryRun } from "#lib/dry-run.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 network routes cidr list\n\nLists and filters private network routes in an account."
		)
		.option("comment", {
			type: "string",
			description: "Optional remark describing the route.",
		})
		.option("is-deleted", {
			type: "boolean",
			description:
				"If `true`, only include deleted routes. If `false`, exclude deleted routes. If empty, all routes will be included.",
		})
		.option("network-subset", {
			type: "string",
			description:
				"If set, only list routes that are contained within this IP range.",
		})
		.option("network-superset", {
			type: "string",
			description: "If set, only list routes that contain this IP range.",
		})
		.option("existed-at", {
			type: "string",
			description:
				"If provided, include only resources that were created (and not deleted) before this time. URL encoded.",
		})
		.option("tunnel-id", { type: "string", description: "UUID of the tunnel." })
		.option("route-id", { type: "string", description: "UUID of the route." })
		.option("tun-types", {
			type: "string",
			description: "The types of tunnels to filter by, separated by commas.",
		})
		.option("virtual-network-id", {
			type: "string",
			description: "UUID of the virtual network.",
		})
		.option("per-page", {
			type: "number",
			description: "Number of results to display.",
		})
		.option("page", {
			type: "number",
			description: "Page number of paginated results.",
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		});
}

type Request = SdkRequest<"tunnel-route-list-tunnel-routes">;
type Query = SdkQuery<"tunnel-route-list-tunnel-routes">;

const typedBuilder = withArgTypes<
	{
		"tun-types": Query["tun_types"];
	},
	typeof builder
>(builder);

type Args = InferArgs<typeof typedBuilder>;
const command: CommandModule<CommonYargsOptions, Args> = {
	command: "list",
	describe: "List tunnel routes",
	builder: typedBuilder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "network routes cidr list",
				classification: {
					safeFlags: ["is-deleted", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Query = {
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
					client.network.routes.cidr.list({
						account_id: accountId,
						...queryParams,
					} satisfies Request)
				);
				formatOutput(result, {
					successLabel: `Loaded`,
					paginationQuery: queryParams,
				});
			}
		),
};

export default command;
