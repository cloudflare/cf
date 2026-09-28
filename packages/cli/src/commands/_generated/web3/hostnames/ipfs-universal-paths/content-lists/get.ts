import { createCommandClient, getZoneId } from "#lib/auth.js";
import { formatDryRun } from "#lib/dry-run.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * get command
 * @generated from apis/overlays/web3.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 web3 hostnames ipfs-universal-paths content-lists get <identifier>\n\nIPFS Universal Path Gateway Content List Details"
		)
		.positional("identifier", {
			type: "string",
			description: "Specify the identifier of the hostname.",
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
	SdkRequest<"web3-hostname-ipfs-universal-path-gateway-content-list-details">;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "get <identifier>",
	describe: "IPFS Universal Path Gateway Content List Details",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "web3 hostnames ipfs-universal-paths content-lists get",
				classification: {
					safeFlags: ["dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					formatDryRun({
						command: "cf web3 hostnames ipfs-universal-paths content-lists get",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/zones/${argv.zone ?? argv.zoneId ?? "<zone>"}/web3/hostnames/${argv["identifier"] == null ? "<identifier>" : encodeURIComponent(String(argv["identifier"]))}/ipfs_universal_path/content_list`,
						pathParams: {
							identifier: String(argv["identifier"] ?? ""),
							"zone-id": String(argv.zone ?? argv["zone-id"] ?? ""),
						},
						bodyKind: "none",
					});
					return;
				}
				const client = await createCommandClient(argv);
				const zoneId = await getZoneId({ zone: argv.zone }, client, {
					quiet: argv.quiet,
				});
				argv.zoneId = zoneId;

				const result = await withProgress(`Loading`, async () =>
					client.web3.hostnames.ipfsUniversalPaths.contentLists.get({
						zone_id: zoneId,
						identifier: argv["identifier"],
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
};

export default command;
