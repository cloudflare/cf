import operation from "../../../../_operations/radar/bgp/rpki/roas/timeseries.js";
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
	describe: "Get RPKI ROA deployment time series",
	usage:
		"$0 radar bgp rpki roas timeseries\n\nRetrieves RPKI ROA (Route Origin Authorization) validation ratios over time. Returns the selected metric as a time series. Supports filtering by ASN or location (country code) — multiple values of the same filter type produce one series per value. If no ASN or location is specified, returns the global aggregate.",
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
		metric: {
			kind: "enum",
			brief:
				"Which RPKI ROA validation metric to return. validPfxsRatio = ratio of RPKI-valid prefixes (IPv4+IPv6 combined). validPfxsV4Ratio / validPfxsV6Ratio = same, split by IP version. validIpsRatio = ratio of RPKI-valid address space (IPv4 /24s + IPv6 /48s). validIpsV4Ratio / validIpsV6Ratio = same, split by IP version.",
			values: [
				"validPfxsRatio",
				"validPfxsV4Ratio",
				"validPfxsV6Ratio",
				"validIpsRatio",
				"validIpsV4Ratio",
				"validIpsV6Ratio",
			],
			optional: true,
		},
		asn: {
			kind: "parsed",
			brief:
				"Filters results by Autonomous System Number. Specify one or more ASNs. Multiple values generate one series per ASN.",
			variadic: true,
			optional: true,
			parse: String,
		},
		location: {
			kind: "parsed",
			brief:
				"Filters results by location. Specify a comma-separated list of alpha-2 location codes.",
			variadic: true,
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
				command: "radar bgp rpki roas timeseries",
				classification: {
					safeFlags: ["metric", "format", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
					dateStart: argv["date-start"],
					dateEnd: argv["date-end"],
					metric: argv["metric"],
					asn: argv["asn"],
					location: argv["location"],
					name: argv["name"],
					format: argv["format"],
				};
				if (argv.dryRun) {
					formatDryRun({
						command: "cf radar bgp rpki roas timeseries",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/radar/bgp/rpki/roas/timeseries`,
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
