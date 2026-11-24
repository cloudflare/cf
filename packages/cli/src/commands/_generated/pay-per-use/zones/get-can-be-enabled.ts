import operation from "../../_operations/pay-per-use/zones/get-can-be-enabled.js";
/**
 * get-can-be-enabled command
 * @generated from apis/overlays/pay-per-use.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
import { createCommandClient, getZoneId } from "#lib/auth.js";
import { formatDryRun } from "#lib/dry-run.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "get-can-be-enabled",
	describe: "Get pay-per-use zone eligibility",
	usage:
		"$0 pay-per-use zones get-can-be-enabled\n\nGets whether pay-per-use can be enabled for a zone and the current zone-level grace period.",
	flags: {
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "pay-per-use zones get-can-be-enabled",
				classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
					typeof argv
				>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					formatDryRun({
						command: "cf pay-per-use zones get-can-be-enabled",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/zones/${argv.zone ?? argv.zoneId ?? "<zone>"}/pay-per-use/can_be_enabled`,
						pathParams: {
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
					client.send(operation, { zone_id: zoneId })
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
});

export default command;
