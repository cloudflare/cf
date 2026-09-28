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
import { formatDryRun } from "#lib/dry-run.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 network virtual-networks list\n\nLists and filters virtual networks in an account."
		)
		.option("id", {
			type: "string",
			description: "UUID of the virtual network.",
		})
		.option("name", {
			type: "string",
			description: "A user-friendly name for the virtual network.",
		})
		.option("is-default", {
			type: "boolean",
			description:
				"If `true`, only include the default virtual network. If `false`, exclude the default virtual network. If empty, all virtual networks will be included.",
		})
		.option("is-default-network", {
			type: "boolean",
			description:
				"If `true`, only include the default virtual network. If `false`, exclude the default virtual network. If empty, all virtual networks will be included.",
		})
		.option("is-deleted", {
			type: "boolean",
			description:
				"If `true`, only include deleted virtual networks. If `false`, exclude deleted virtual networks. If empty, all virtual networks will be included.",
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		});
}

type Args = InferArgs<typeof builder>;

type Request = SdkRequest<"tunnel-virtual-network-list-virtual-networks">;
type Query = SdkQuery<"tunnel-virtual-network-list-virtual-networks">;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "list",
	describe: "List virtual networks",
	builder,
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
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Query = {
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
					client.network.virtualNetworks.list({
						account_id: accountId,
						...queryParams,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
};

export default command;
