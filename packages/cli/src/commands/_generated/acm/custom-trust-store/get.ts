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
 * @generated from apis/overlays/acm.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 acm custom-trust-store get <custom-origin-trust-store-id>\n\nRetrieves details about a specific root CA certificate in the custom origin trust store, including expiration and subject information."
		)
		.positional("custom-origin-trust-store-id", {
			type: "string",
			description: "Certificate identifier tag.",
			demandOption: true,
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		});
}

type Args = InferArgs<typeof builder>;

type Request = SdkRequest<"custom-origin-trust-store-details">;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "get <custom-origin-trust-store-id>",
	describe: "Custom Origin Trust Store Details",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "acm custom-trust-store get",
				classification: {
					safeFlags: ["dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					formatDryRun({
						command: "cf acm custom-trust-store get",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/zones/${argv.zone ?? argv.zoneId ?? "<zone>"}/acm/custom_trust_store/${argv["custom-origin-trust-store-id"] == null ? "<custom-origin-trust-store-id>" : encodeURIComponent(String(argv["custom-origin-trust-store-id"]))}`,
						pathParams: {
							"custom-origin-trust-store-id": String(
								argv["custom-origin-trust-store-id"] ?? ""
							),
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
					client.acm.customTrustStore.get({
						zone_id: zoneId,
						custom_origin_trust_store_id: argv["custom-origin-trust-store-id"],
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
};

export default command;
