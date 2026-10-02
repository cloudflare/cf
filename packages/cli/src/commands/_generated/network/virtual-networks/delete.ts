import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * delete command
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
import { confirmDelete } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 network virtual-networks delete <virtual-network-id>\n\nDeletes an existing virtual network."
		)
		.positional("virtual-network-id", {
			type: "string",
			description: "UUID of the virtual network.",
			demandOption: true,
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		})
		.option("force", {
			type: "boolean",
			alias: "f",
			description: "Skip confirmation (useful in scripts and CI)",
			default: false,
		});
}

type Args = InferArgs<typeof builder>;

type Request = SdkRequest<"tunnel-virtual-network-delete">;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "delete <virtual-network-id>",
	describe: "Delete a virtual network",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "network virtual-networks delete",
				classification: {
					safeFlags: ["dry-run", "force"],
					shortFlagAliases: { f: { canonical: "force", type: "boolean" } },
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf network virtual-networks delete",
						method: "DELETE",
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

				if (
					!(await confirmDelete({
						force: Boolean(argv.force),
						message: `This operation permanently deletes a virtual network.`,
					}))
				) {
					process.stderr.write("Aborted.\n");
					return;
				}

				const result = await withProgress(`Deleting`, async () =>
					client.network.virtualNetworks.delete({
						account_id: accountId,
						virtual_network_id: argv["virtual-network-id"],
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Deleted` });
			}
		),
};

export default command;
