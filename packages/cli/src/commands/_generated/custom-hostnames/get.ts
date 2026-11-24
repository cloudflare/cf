import operation from "../_operations/custom-hostnames/get.js";
/**
 * get command
 * @generated from apis/overlays/custom-hostnames.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
import { createCommandClient, getZoneId } from "#lib/auth.js";
import { formatDryRun } from "#lib/dry-run.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "get <custom-hostname-id>",
	describe: "Custom Hostname Details",
	usage:
		"$0 custom-hostnames get <custom-hostname-id>\n\nRetrieves detailed information about a specific custom hostname, including SSL certificate status, ownership verification, and origin configuration.",
	flags: {
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [
		{
			placeholder: "custom-hostname-id",
			brief: "Custom hostname identifier tag.",
			parse: String,
		},
	],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "custom-hostnames get",
				classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
					typeof argv
				>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					formatDryRun({
						command: "cf custom-hostnames get",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/zones/${argv.zone ?? argv.zoneId ?? "<zone>"}/custom_hostnames/${argv["custom-hostname-id"] == null ? "<custom-hostname-id>" : encodeURIComponent(String(argv["custom-hostname-id"]))}`,
						pathParams: {
							"zone-id": String(argv.zone ?? argv["zone-id"] ?? ""),
							"custom-hostname-id": String(argv["custom-hostname-id"] ?? ""),
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
					client.send(operation, {
						zone_id: zoneId,
						custom_hostname_id: argv["custom-hostname-id"],
					})
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
});

export default command;
