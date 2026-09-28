import { createCommandClient } from "#lib/auth.js";
import { withArgTypes } from "#lib/cli-types.js";
import { formatDryRun } from "#lib/dry-run.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkQuery } from "#sdk";
/**
 * get command
 * @generated from apis/overlays/radar.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 radar traffic-anomalies get\n\nRetrieves the latest Internet traffic anomalies, which are signals that might indicate an outage. These alerts are automatically detected by Radar and manually verified by our team."
		)
		.option("limit", {
			type: "number",
			description: "Limits the number of objects returned in the response.",
		})
		.option("offset", {
			type: "number",
			description:
				"Skips the specified number of objects before fetching the results.",
		})
		.option("date-range", {
			type: "string",
			description:
				"Filters results by a relative date range ending at the current time. Use `<n>d` for days (up to `364d`) or `<n>w` for weeks (up to `52w`), e.g. `7d`. Append `control` to request the equivalent previous period for comparison: the comparison window is shifted back by the current window's length rounded up to a whole number of weeks, so it keeps the same weekday alignment and does not overlap the current window (e.g. `3dcontrol` covers days -10 to -7, `7dcontrol` covers days -14 to -7, `28dcontrol` covers days -56 to -28, and `10dcontrol` covers days -24 to -14). Mutually exclusive with `dateStart`/`dateEnd`.",
		})
		.option("date-start", {
			type: "string",
			description:
				"Start of the date range (inclusive). Alternative to `dateRange`; provide together with `dateEnd`.",
		})
		.option("date-end", {
			type: "string",
			description:
				"End of the date range (inclusive). Alternative to `dateRange`; provide together with `dateStart`.",
		})
		.option("status", {
			type: "string",
			description: "Status",
			choices: ["VERIFIED", "UNVERIFIED"],
		})
		.option("type", {
			type: "string",
			description: "Filters results by entity type (LOCATION, AS, or ORIGIN).",
		})
		.option("data-source", {
			type: "string",
			description: "Filters results by data source.",
			choices: [
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
		})
		.option("asn", {
			type: "number",
			description:
				"Filters results by Autonomous System. Specify a single Autonomous System Number (ASN) as integer.",
		})
		.option("location", {
			type: "string",
			description:
				"Filters results by location. Specify an alpha-2 location code.",
		})
		.option("origin", {
			type: "string",
			description: "Filters results by origin.",
		})
		.option("format", {
			type: "string",
			description: "Format in which results will be returned.",
			choices: ["JSON", "CSV"],
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		});
}

type Query = SdkQuery<"radar-get-traffic-anomalies">;

const typedBuilder = withArgTypes<
	{
		status: Query["status"];
		type: Query["type"];
		"data-source": Query["dataSource"];
		format: Query["format"];
	},
	typeof builder
>(builder);

type Args = InferArgs<typeof typedBuilder>;
const command: CommandModule<CommonYargsOptions, Args> = {
	command: "get",
	describe: "Get latest Internet traffic anomalies",
	builder: typedBuilder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "radar traffic-anomalies get",
				classification: {
					safeFlags: ["status", "data-source", "format", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Query = {
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
						command: "cf radar traffic-anomalies get",
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
					client.radar.trafficAnomalies.get(queryParams)
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
};

export default command;
