import { createCommandClient, getZoneId } from "#lib/auth.js";
import { formatDryRun } from "#lib/dry-run.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkQuery, SdkRequest } from "#sdk";
/**
 * get command
 * @generated from apis/overlays/dns.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 dns records get <dns-record-id>\n\nRetrieves details for a specific DNS record in the zone."
		)
		.positional("dns-record-id", {
			type: "string",
			description: "Identifier.",
			demandOption: true,
		})
		.option("include-shadow-metadata", {
			type: "boolean",
			description:
				"Whether to include shadow metadata in the `meta` field of each record in the response. See [Shadowed records](https://developers.cloudflare.com/dns/manage-dns-records/reference/shadowed-records).",
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		});
}

type Args = InferArgs<typeof builder>;

type Request = SdkRequest<"dns-records-for-a-zone-dns-record-details">;
type Query = SdkQuery<"dns-records-for-a-zone-dns-record-details">;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "get <dns-record-id>",
	describe: "DNS Record Details",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "dns records get",
				classification: {
					safeFlags: ["include-shadow-metadata", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Query = {
					include_shadow_metadata: argv["include-shadow-metadata"],
				};
				if (argv.dryRun) {
					formatDryRun({
						command: "cf dns records get",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/zones/${argv.zone ?? argv.zoneId ?? "<zone>"}/dns_records/${argv["dns-record-id"] == null ? "<dns-record-id>" : encodeURIComponent(String(argv["dns-record-id"]))}`,
						pathParams: {
							"dns-record-id": String(argv["dns-record-id"] ?? ""),
							"zone-id": String(argv.zone ?? argv["zone-id"] ?? ""),
						},
						query: queryParams,
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
					client.dns.records.get({
						zone_id: zoneId,
						dns_record_id: argv["dns-record-id"],
						...queryParams,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
};

export default command;
