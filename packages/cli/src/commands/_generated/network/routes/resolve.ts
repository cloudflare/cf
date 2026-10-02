import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkQuery, SdkRequest } from "#sdk";
/**
 * resolve command
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
			"$0 network routes resolve <ip>\n\nFetches routes that contain the given IP address."
		)
		.positional("ip", {
			type: "string",
			description: "Ip",
			demandOption: true,
		})
		.option("virtual-network-id", {
			type: "string",
			description: "UUID of the virtual network.",
		})
		.option("default-virtual-network-fallback", {
			type: "boolean",
			description:
				"When the virtual_network_id parameter is not provided the request filter will default search routes that are in the default virtual network for the account. If this parameter is set to false, the search will include routes that do not have a virtual network.",
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		});
}

type Args = InferArgs<typeof builder>;

type Request = SdkRequest<"tunnel-route-get-tunnel-route-by-ip">;
type Query = SdkQuery<"tunnel-route-get-tunnel-route-by-ip">;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "resolve <ip>",
	describe: "Get tunnel route by IP",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "network routes resolve",
				classification: {
					safeFlags: ["default-virtual-network-fallback", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Query = {
					virtual_network_id: argv["virtual-network-id"],
					default_virtual_network_fallback:
						argv["default-virtual-network-fallback"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf network routes resolve",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/teamnet/routes/ip/${argv["ip"] == null ? "<ip>" : encodeURIComponent(String(argv["ip"]))}`,
						pathParams: { ip: String(argv["ip"] ?? "") },
						query: queryParams,
						bodyKind: "none",
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				const result = await withProgress(`Loading`, async () =>
					client.network.routes.resolve({
						account_id: accountId,
						ip: argv["ip"],
						...queryParams,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
};

export default command;
