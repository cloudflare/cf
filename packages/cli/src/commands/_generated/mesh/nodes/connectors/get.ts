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
 * get command
 * @generated from apis/overlays/mesh.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 mesh nodes connectors get <connector-id>\n\nFetches connector and connection details for a WARP Connector Tunnel."
		)
		.positional("connector-id", {
			type: "string",
			description: "UUID of the Cloudflare Tunnel connector.",
			demandOption: true,
		})
		.option("tunnel-id", {
			type: "string",
			description: "UUID of the tunnel.",
			demandOption: true,
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		});
}

type Args = InferArgs<typeof builder>;

type Request =
	SdkRequest<"cloudflare-tunnel-get-warp-connector-tunnel-connector">;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "get <connector-id>",
	describe: "Get WARP Connector Tunnel connector",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "mesh nodes connectors get",
				classification: {
					safeFlags: ["dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf mesh nodes connectors get",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/warp_connector/${argv["tunnel-id"] == null ? "<tunnel-id>" : encodeURIComponent(String(argv["tunnel-id"]))}/connectors/${argv["connector-id"] == null ? "<connector-id>" : encodeURIComponent(String(argv["connector-id"]))}`,
						pathParams: {
							"tunnel-id": String(argv["tunnel-id"] ?? ""),
							"connector-id": String(argv["connector-id"] ?? ""),
						},
						bodyKind: "none",
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				const result = await withProgress(`Loading`, async () =>
					client.mesh.nodes.connectors.get({
						account_id: accountId,
						tunnel_id: argv["tunnel-id"],
						connector_id: argv["connector-id"],
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
};

export default command;
