import operation from "../../../../_operations/radar/bgp/rpki/aspa/timeseries.js";
/**
 * timeseries command
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
	command: "timeseries",
	describe: "Get ASPA count time series",
	usage:
		"$0 radar bgp rpki aspa timeseries\n\nRetrieves ASPA (Autonomous System Provider Authorization) object count over time. Supports filtering by RIR or location (country code) to generate multiple named series. If no RIR or location filter is specified, returns total count.",
	flags: {
		"date-start": {
			kind: "parsed",
			brief:
				"Start of the date range (inclusive). Alternative to `dateRange`; provide together with `dateEnd`.",
			optional: true,
			parse: String,
		},
		"date-end": {
			kind: "parsed",
			brief:
				"End of the date range (inclusive). Alternative to `dateRange`; provide together with `dateStart`.",
			optional: true,
			parse: String,
		},
		name: {
			kind: "parsed",
			brief: "Array of names used to label the series in the response.",
			variadic: true,
			optional: true,
			parse: String,
		},
		rir: {
			kind: "parsed",
			brief:
				"Filter by Regional Internet Registry (RIR). Multiple RIRs generate multiple series.",
			variadic: true,
			optional: true,
			choices: ["RIPE_NCC", "ARIN", "APNIC", "LACNIC", "AFRINIC"],
			parse: String,
			coerce: (values: string[]) => values.flatMap((value) => value.split(",")),
		},
		location: {
			kind: "parsed",
			brief:
				"Filters results by location. Specify a comma-separated list of alpha-2 location codes.",
			variadic: true,
			optional: true,
			parse: String,
		},
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
	operands: [],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "radar bgp rpki aspa timeseries",
				classification: {
					safeFlags: ["format", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
					dateStart: argv["date-start"],
					dateEnd: argv["date-end"],
					name: argv["name"],
					rir: argv["rir"],
					location: argv["location"],
					format: argv["format"],
				};
				if (argv.dryRun) {
					formatDryRun({
						command: "cf radar bgp rpki aspa timeseries",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/radar/bgp/rpki/aspa/timeseries`,
						pathParams: {},
						query: queryParams,
						bodyKind: "none",
					});
					return;
				}
				const client = await createCommandClient(argv);

				const result = await withProgress(`Loading`, async () =>
					client.send(operation, queryParams)
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
});

export default command;
