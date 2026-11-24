import operation from "../../_operations/dns/records/get.js";
/**
 * get command
 * @generated from apis/overlays/dns.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
import { createCommandClient, getZoneId } from "#lib/auth.js";
import { formatDryRun } from "#lib/dry-run.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "get <dns-record-id>",
	describe: "DNS Record Details",
	usage:
		"$0 dns records get <dns-record-id>\n\nRetrieves details for a specific DNS record in the zone.",
	flags: {
		"include-shadow-metadata": {
			kind: "boolean",
			brief:
				"Whether to include shadow metadata in the `meta` field of each record in the response. See [Shadowed records](https://developers.cloudflare.com/dns/manage-dns-records/reference/shadowed-records).",
			optional: true,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [
		{ placeholder: "dns-record-id", brief: "Identifier.", parse: String },
	],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "dns records get",
				classification: {
					safeFlags: ["include-shadow-metadata", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
					include_shadow_metadata: argv["include-shadow-metadata"],
				};
				if (argv.dryRun) {
					formatDryRun({
						command: "cf dns records get",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/zones/${argv.zone ?? argv.zoneId ?? "<zone>"}/dns_records/${argv["dns-record-id"] == null ? "<dns-record-id>" : encodeURIComponent(String(argv["dns-record-id"]))}`,
						pathParams: {
							"zone-id": String(argv.zone ?? argv["zone-id"] ?? ""),
							"dns-record-id": String(argv["dns-record-id"] ?? ""),
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
					client.send(operation, {
						zone_id: zoneId,
						dns_record_id: argv["dns-record-id"],
						...queryParams,
					})
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
});

export default command;
