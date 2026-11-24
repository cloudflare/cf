import operation from "../../_operations/acm/custom-trust-store/get.js";
/**
 * get command
 * @generated from apis/overlays/acm.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
import { createCommandClient, getZoneId } from "#lib/auth.js";
import { formatDryRun } from "#lib/dry-run.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "get <custom-origin-trust-store-id>",
	describe: "Custom Origin Trust Store Details",
	usage:
		"$0 acm custom-trust-store get <custom-origin-trust-store-id>\n\nRetrieves details about a specific root CA certificate in the custom origin trust store, including expiration and subject information.",
	flags: {
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [
		{
			placeholder: "custom-origin-trust-store-id",
			brief: "Certificate identifier tag.",
			parse: String,
		},
	],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "acm custom-trust-store get",
				classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
					typeof argv
				>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					formatDryRun({
						command: "cf acm custom-trust-store get",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/zones/${argv.zone ?? argv.zoneId ?? "<zone>"}/acm/custom_trust_store/${argv["custom-origin-trust-store-id"] == null ? "<custom-origin-trust-store-id>" : encodeURIComponent(String(argv["custom-origin-trust-store-id"]))}`,
						pathParams: {
							"zone-id": String(argv.zone ?? argv["zone-id"] ?? ""),
							"custom-origin-trust-store-id": String(
								argv["custom-origin-trust-store-id"] ?? ""
							),
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
						custom_origin_trust_store_id: argv["custom-origin-trust-store-id"],
					})
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
});

export default command;
