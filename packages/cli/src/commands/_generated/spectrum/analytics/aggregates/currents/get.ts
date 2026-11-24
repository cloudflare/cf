import operation from "../../../../_operations/spectrum/analytics/aggregates/currents/get.js";
/**
 * get command
 * @generated from apis/overlays/spectrum.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
import { createCommandClient, getZoneId } from "#lib/auth.js";
import { formatDryRun } from "#lib/dry-run.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "get",
	describe: "Get current aggregated analytics",
	usage:
		"$0 spectrum analytics aggregates currents get\n\nRetrieves analytics aggregated from the last minute of usage on Spectrum applications underneath a given zone.",
	flags: {
		"app-id": {
			kind: "parsed",
			brief:
				"Comma-delimited list of Spectrum Application Id(s). If provided, the response will be limited to Spectrum Application Id(s) that match.",
			optional: true,
			parse: String,
		},
		"colo-name": {
			kind: "parsed",
			brief: "Co-location identifier.",
			optional: true,
			parse: String,
		},
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
				command: "spectrum analytics aggregates currents get",
				classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
					typeof argv
				>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
					appID: argv["app-id"],
					colo_name: argv["colo-name"],
				};
				if (argv.dryRun) {
					formatDryRun({
						command: "cf spectrum analytics aggregates currents get",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/zones/${argv.zone ?? argv.zoneId ?? "<zone>"}/spectrum/analytics/aggregate/current`,
						pathParams: {
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
					client.send(operation, { zone_id: zoneId, ...queryParams })
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
});

export default command;
