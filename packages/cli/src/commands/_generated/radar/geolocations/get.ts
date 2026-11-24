import operation from "../../_operations/radar/geolocations/get.js";
/**
 * get command
 * @generated from apis/overlays/radar.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
import { createCommandClient } from "#lib/auth.js";
import { formatDryRun } from "#lib/dry-run.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "get <geo-id>",
	describe: "Get Geolocation details",
	usage:
		"$0 radar geolocations get <geo-id>\n\nRetrieves the requested Geolocation information. Geolocation names can be localized by sending an `Accept-Language` HTTP header with a BCP 47 language tag (e.g., `Accept-Language: pt-PT`). The full quality-value chain is supported (e.g., `pt-PT,pt;q=0.9,en;q=0.8`).",
	flags: {
		format: {
			kind: "enum",
			brief: "Format in which results will be returned.",
			values: ["JSON", "CSV"],
			optional: true,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [
		{
			placeholder: "geo-id",
			brief:
				"Geolocation ID. Refer to [GeoNames](https://download.geonames.org/export/dump/readme.txt)",
			parse: String,
		},
	],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "radar geolocations get",
				classification: {
					safeFlags: ["format", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
					format: argv["format"],
				};
				if (argv.dryRun) {
					formatDryRun({
						command: "cf radar geolocations get",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/radar/geolocations/${argv["geo-id"] == null ? "<geo-id>" : encodeURIComponent(String(argv["geo-id"]))}`,
						pathParams: { "geo-id": String(argv["geo-id"] ?? "") },
						query: queryParams,
						bodyKind: "none",
					});
					return;
				}
				const client = await createCommandClient(argv);

				const result = await withProgress(`Loading`, async () =>
					client.send(operation, { geo_id: argv["geo-id"], ...queryParams })
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
});

export default command;
