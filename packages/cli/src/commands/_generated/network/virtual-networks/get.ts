import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * get command
 * @generated from apis/overlays/network.ts
 */
import type { Argv, CommandModule } from "yargs";
import {
	createCommandClient,
	getAccountId,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 network virtual-networks get <virtual-network-id>\n\nGet a virtual network."
		)
		.positional("virtual-network-id", {
			type: "string",
			description: "UUID of the virtual network.",
			demandOption: true,
		})
		.option("comment", {
			type: "string",
			description: "Optional remark describing the virtual network.",
			default: "",
		})
		.option("is-default-network", {
			type: "boolean",
			description:
				"If `true`, this virtual network is the default for the account.",
		})
		.option("name", {
			type: "string",
			description: "A user-friendly name for the virtual network.",
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		});
}

type Args = InferArgs<typeof builder>;

type Request = SdkRequest<"tunnel-virtual-network-get">;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "get <virtual-network-id>",
	describe: "Get a virtual network",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "network virtual-networks get",
				classification: {
					safeFlags: ["is-default-network", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf network virtual-networks get",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/teamnet/virtual_networks/${argv["virtual-network-id"] == null ? "<virtual-network-id>" : encodeURIComponent(String(argv["virtual-network-id"]))}`,
						pathParams: {
							"virtual-network-id": String(argv["virtual-network-id"] ?? ""),
						},
						bodyKind: "none",
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				const result = await withProgress(`Loading`, async () =>
					client.network.virtualNetworks.get({
						account_id: accountId,
						virtual_network_id: argv["virtual-network-id"],
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
};

export default command;
