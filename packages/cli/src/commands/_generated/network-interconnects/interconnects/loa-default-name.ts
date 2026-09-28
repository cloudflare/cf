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
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * loa-default-name command
 * @generated from apis/overlays/network-interconnects.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 network-interconnects interconnects loa-default-name <icon>\n\nRetrieves the default customer name that will be used in the LOA if no name is provided to the `/accounts/{account_id}/cni/interconnects/{icon}/loa` endpoint."
		)
		.positional("icon", {
			type: "string",
			description: "Interconnect name to retrieve information about",
			demandOption: true,
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		});
}

type Args = InferArgs<typeof builder>;

type Request = SdkRequest<"get_interconnect_loa_default_name">;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "loa-default-name <icon>",
	describe: "Get the default customer name for LOA generation",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "network-interconnects interconnects loa-default-name",
				classification: {
					safeFlags: ["dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf network-interconnects interconnects loa-default-name",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/cni/interconnects/${argv["icon"] == null ? "<icon>" : encodeURIComponent(String(argv["icon"]))}/loa/default`,
						pathParams: { icon: String(argv["icon"] ?? "") },
						bodyKind: "none",
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				const result = await withProgress(`Loading`, async () =>
					client.networkInterconnects.interconnects.loaDefaultName({
						account_id: accountId,
						icon: argv["icon"],
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
};

export default command;
