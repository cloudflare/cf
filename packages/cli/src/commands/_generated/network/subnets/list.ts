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
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkQuery, SdkRequest } from "#sdk";
/**
 * list command
 * @generated from apis/overlays/network.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 network subnets list\n\nLists and filters subnets in an account."
		)
		.option("name", {
			type: "string",
			description: "If set, only list subnets with the given name",
		})
		.option("comment", {
			type: "string",
			description: "If set, only list subnets with the given comment.",
		})
		.option("network", {
			type: "string",
			description:
				"If set, only list the subnet whose network exactly matches the given CIDR.",
		})
		.option("existed-at", {
			type: "string",
			description:
				"If provided, include only resources that were created (and not deleted) before this time. URL encoded.",
		})
		.option("address-family", {
			type: "string",
			description:
				"If set, only include subnets in the given address family - `v4` or `v6`",
			choices: ["v4", "v6"],
		})
		.option("is-default-network", {
			type: "boolean",
			description:
				"If `true`, only include default subnets. If `false`, exclude default subnets subnets. If not set, all subnets will be included.",
		})
		.option("is-deleted", {
			type: "boolean",
			description:
				"If `true`, only include deleted subnets. If `false`, exclude deleted subnets. If not set, all subnets will be included.",
		})
		.option("sort-order", {
			type: "string",
			description:
				"Sort order of the results. `asc` means oldest to newest, `desc` means newest to oldest. If not set, they will not be in any particular order.",
			choices: ["asc", "desc"],
		})
		.option("subnet-types", {
			type: "string",
			description:
				"If set, the types of subnets to include, separated by comma.",
			choices: ["cloudflare_source", "initial_resolved_ip", "warp"],
		})
		.option("per-page", {
			type: "number",
			description: "Number of results to display.",
		})
		.check((argv) => {
			if (argv["per-page"] !== undefined && !Number.isFinite(argv["per-page"]))
				throw new Error("--per-page must be a number");
			return true;
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

type Request = SdkRequest<"zero-trust-networks-subnets-list">;
type Query = SdkQuery<"zero-trust-networks-subnets-list">;

const typedBuilder = withArgTypes<
	{
		"address-family": Query["address_family"];
		"sort-order": Query["sort_order"];
		"subnet-types": Query["subnet_types"];
	},
	typeof builder
>(builder);

type Args = InferArgs<typeof typedBuilder>;
const command: CommandModule<CommonYargsOptions, Args> = {
	command: "list",
	describe: "List Subnets",
	builder: typedBuilder,
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
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Query = {
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
					client.network.subnets.list({
						account_id: accountId,
						...queryParams,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
};

export default command;
