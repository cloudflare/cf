import { createCommandClient } from "#lib/auth.js";
import { withArgTypes } from "#lib/cli-types.js";
import { formatDryRun } from "#lib/dry-run.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkQuery, SdkRequest } from "#sdk";
/**
 * timeseries-groups-v2 command
 * @generated from apis/overlays/radar.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 radar http timeseries-groups-v2 <dimension>\n\nRetrieves the distribution of HTTP requests grouped by dimension."
		)
		.positional("dimension", {
			type: "string",
			description:
				"Specifies the HTTP attribute by which to group the results.",
			demandOption: true,
		})
		.option("agg-interval", {
			type: "string",
			description:
				"Aggregation interval of the results (e.g., in 15 minutes or 1 hour intervals). Refer to [Aggregation intervals](https://developers.cloudflare.com/radar/concepts/aggregation-intervals/). When omitted, the interval is auto-selected from the requested date range; finer intervals are only available for shorter ranges. If the requested interval is too granular for the date range, the request is rejected.",
			choices: ["15m", "1h", "1d", "1w"],
		})
		.option("name", {
			type: "string",
			description: "Array of names used to label the series in the response.",
		})
		.option("date-range", {
			type: "string",
			description:
				"Filters results by relative date range ending at the current time, with each value producing a separate series. Use `<n>d` for days (up to `364d`) or `<n>w` for weeks (up to `52w`). Append `control` to request the equivalent previous period for comparison: the comparison window is shifted back by the current window's length rounded up to a whole number of weeks, so it keeps the same weekday alignment and does not overlap the current window (e.g. `7dcontrol` covers days -14 to -7, `10dcontrol` covers days -24 to -14). For example, pass `7d` and `7dcontrol` to compare this week with the previous week. All series must resolve to the same duration as the main series; relative ranges (including `control`) satisfy this automatically. Use this parameter or set specific start and end dates (`dateStart` and `dateEnd` parameters).",
		})
		.option("date-start", {
			type: "string",
			description:
				"Start of the date range. Alternative to `dateRange`; provide together with `dateEnd`. When requesting comparison series, every series must resolve to the same duration as the main series. Each `dateStart`/`dateEnd` is floored to the nearest 15 minutes before evaluation, so windows whose durations match only before alignment may be rejected.",
		})
		.option("date-end", {
			type: "string",
			description:
				"End of the date range (inclusive). Alternative to `dateRange`; provide together with `dateStart`. When requesting comparison series, every series must resolve to the same duration as the main series. Each `dateStart`/`dateEnd` is floored to the nearest 15 minutes before evaluation, so windows whose durations match only before alignment may be rejected.",
		})
		.option("asn", {
			type: "string",
			description:
				"Filters results by Autonomous System. Specify one or more Autonomous System Numbers (ASNs) as a comma-separated list. Prefix with `-` to exclude ASNs from results. For example, `-174, 3356` excludes results from AS174, but includes results from AS3356.",
		})
		.option("location", {
			type: "string",
			description:
				"Filters results by location. Specify a comma-separated list of alpha-2 codes. Prefix with `-` to exclude locations from results. For example, `-US,PT` excludes results from the US, but includes results from PT.",
		})
		.option("continent", {
			type: "string",
			description:
				"Filters results by continent. Specify a comma-separated list of alpha-2 codes. Prefix with `-` to exclude continents from results. For example, `-EU,NA` excludes results from EU, but includes results from NA.",
		})
		.option("geo-id", {
			type: "string",
			description:
				"Filters results by Geolocation. Specify a comma-separated list of GeoNames IDs. Prefix with `-` to exclude geoIds from results. For example, `-2267056,360689` excludes results from the 2267056 (Lisbon), but includes results from 5128638 (New York).",
		})
		.option("api-traffic", {
			type: "string",
			description:
				"Filters results by API traffic classification. API traffic is identified by JSON or XML response content types on dynamic (non-cacheable) HTTP requests. Incompatible with the `browserFamily`, `deviceType`, `httpProtocol`, `httpVersion`, `ipVersion`, `os`, and `tlsVersion` filters/dimensions. When set, results can only be further filtered by location, continent, or Autonomous System.",
		})
		.option("bot-class", {
			type: "string",
			description:
				"Filters results by bot class. Refer to [Bot classes](https://developers.cloudflare.com/radar/concepts/bot-classes/).",
		})
		.option("content-type", {
			type: "string",
			description:
				"Filters results by content type category. When set, results can only be further filtered by location, continent, or Autonomous System.",
		})
		.option("limit-per-group", {
			type: "number",
			description:
				'Limits the number of objects per group to the top items within the specified time range. When item count exceeds the limit, extra items appear grouped under an "other" category. Only supported on high-cardinality dimensions; otherwise the request is rejected. Minimum value is 2.',
		})
		.option("device-type", {
			type: "string",
			description: "Filters results by device type.",
		})
		.option("http-protocol", {
			type: "string",
			description: "Filters results by HTTP protocol (HTTP vs. HTTPS).",
		})
		.option("http-version", {
			type: "string",
			description: "Filters results by HTTP version.",
		})
		.option("normalization", {
			type: "string",
			description:
				"Normalization method applied to the results. Refer to [Normalization methods](https://developers.cloudflare.com/radar/concepts/normalization/).",
			choices: ["PERCENTAGE", "MIN0_MAX"],
		})
		.option("ip-version", {
			type: "string",
			description: "Filters results by IP version (Ipv4 vs. IPv6).",
		})
		.option("os", {
			type: "string",
			description: "Filters results by operating system.",
		})
		.option("tls-version", {
			type: "string",
			description: "Filters results by TLS version.",
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

type Request = SdkRequest<"radar-get-http-timeseries-group">;
type Query = SdkQuery<"radar-get-http-timeseries-group">;

const typedBuilder = withArgTypes<
	{
		"agg-interval": Query["aggInterval"];
		"api-traffic": Query["apiTraffic"];
		"bot-class": Query["botClass"];
		"content-type": Query["contentType"];
		"device-type": Query["deviceType"];
		"http-protocol": Query["httpProtocol"];
		"http-version": Query["httpVersion"];
		normalization: Query["normalization"];
		"ip-version": Query["ipVersion"];
		os: Query["os"];
		"tls-version": Query["tlsVersion"];
		format: Query["format"];
		dimension: Request["dimension"];
	},
	typeof builder
>(builder);

type Args = InferArgs<typeof typedBuilder>;
const command: CommandModule<CommonYargsOptions, Args> = {
	command: "timeseries-groups-v2 <dimension>",
	describe: "Get HTTP requests time series grouped by dimension",
	builder: typedBuilder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "radar http timeseries-groups-v2",
				classification: {
					safeFlags: ["agg-interval", "normalization", "format", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Query = {
					aggInterval: argv["agg-interval"],
					name: argv["name"],
					dateRange: argv["date-range"],
					dateStart: argv["date-start"],
					dateEnd: argv["date-end"],
					asn: argv["asn"],
					location: argv["location"],
					continent: argv["continent"],
					geoId: argv["geo-id"],
					apiTraffic: argv["api-traffic"],
					botClass: argv["bot-class"],
					contentType: argv["content-type"],
					limitPerGroup: argv["limit-per-group"],
					deviceType: argv["device-type"],
					httpProtocol: argv["http-protocol"],
					httpVersion: argv["http-version"],
					normalization: argv["normalization"],
					ipVersion: argv["ip-version"],
					os: argv["os"],
					tlsVersion: argv["tls-version"],
					format: argv["format"],
				};
				if (argv.dryRun) {
					formatDryRun({
						command: "cf radar http timeseries-groups-v2",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/radar/http/timeseries_groups/${argv["dimension"] == null ? "<dimension>" : encodeURIComponent(String(argv["dimension"]))}`,
						pathParams: { dimension: String(argv["dimension"] ?? "") },
						query: queryParams,
						bodyKind: "none",
					});
					return;
				}
				const client = await createCommandClient(argv);

				const result = await withProgress(`Loading`, async () =>
					client.radar.http.timeseriesGroupsV2({
						dimension: argv["dimension"],
						...queryParams,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
};

export default command;
