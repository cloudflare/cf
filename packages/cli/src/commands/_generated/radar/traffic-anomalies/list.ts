import operation from "../../_operations/radar/traffic-anomalies/list.js";
/**
 * list command
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
	command: "list",
	describe: "Get latest Internet traffic anomalies",
	usage:
		"$0 radar traffic-anomalies list\n\nRetrieves the latest Internet traffic anomalies, which are signals that might indicate an outage. These alerts are automatically detected by Radar and manually verified by our team.",
	flags: {
		limit: {
			kind: "parsed",
			brief: "Limits the number of objects returned in the response.",
			optional: true,
			parse: Number,
		},
		offset: {
			kind: "parsed",
			brief:
				"Skips the specified number of objects before fetching the results.",
			optional: true,
			parse: Number,
		},
		"date-range": {
			kind: "parsed",
			brief:
				"Filters results by a relative date range ending at the current time. Use `<n>d` for days (up to `364d`) or `<n>w` for weeks (up to `52w`), e.g. `7d`. Append `control` to request the equivalent previous period for comparison: the comparison window is shifted back by the current window's length rounded up to a whole number of weeks, so it keeps the same weekday alignment and does not overlap the current window (e.g. `3dcontrol` covers days -10 to -7, `7dcontrol` covers days -14 to -7, `28dcontrol` covers days -56 to -28, and `10dcontrol` covers days -24 to -14). Mutually exclusive with `dateStart`/`dateEnd`.",
			optional: true,
			parse: String,
		},
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
		status: {
			kind: "enum",
			brief: "Status",
			values: ["VERIFIED", "UNVERIFIED"],
			optional: true,
		},
		type: {
			kind: "parsed",
			brief: "Filters results by entity type (LOCATION, AS, or ORIGIN).",
			variadic: true,
			optional: true,
			choices: ["LOCATION", "AS", "ORIGIN"],
			parse: String,
			coerce: (values: string[]) => values.flatMap((value) => value.split(",")),
		},
		"data-source": {
			kind: "enum",
			brief: "Filters results by data source.",
			values: [
				"ALL",
				"AI_BOTS",
				"AI_GATEWAY",
				"BGP",
				"BOTS",
				"CONNECTION_ANOMALY",
				"CT",
				"DNS",
				"DNS_MAGNITUDE",
				"DNS_AS112",
				"DOS",
				"EMAIL_ROUTING",
				"EMAIL_SECURITY",
				"FW",
				"FW_PG",
				"HTTP",
				"HTTP_CONTROL",
				"HTTP_CRAWLER_REFERER",
				"HTTP_ORIGINS",
				"IQI",
				"LEAKED_CREDENTIALS",
				"NET",
				"ROBOTS_TXT",
				"SPEED",
				"WORKERS_AI",
			],
			optional: true,
		},
		asn: {
			kind: "parsed",
			brief:
				"Filters results by Autonomous System. Specify a single Autonomous System Number (ASN) as integer.",
			optional: true,
			parse: Number,
		},
		location: {
			kind: "parsed",
			brief: "Filters results by location. Specify an alpha-2 location code.",
			optional: true,
			parse: String,
		},
		origin: {
			kind: "parsed",
			brief: "Filters results by origin.",
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
				command: "radar traffic-anomalies list",
				classification: {
					safeFlags: ["status", "data-source", "format", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
					limit: argv["limit"],
					offset: argv["offset"],
					dateRange: argv["date-range"],
					dateStart: argv["date-start"],
					dateEnd: argv["date-end"],
					status: argv["status"],
					type: argv["type"],
					dataSource: argv["data-source"],
					asn: argv["asn"],
					location: argv["location"],
					origin: argv["origin"],
					format: argv["format"],
				};
				if (argv.dryRun) {
					formatDryRun({
						command: "cf radar traffic-anomalies list",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/radar/traffic_anomalies`,
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
