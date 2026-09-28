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
			"$0 radar dns timeseries-groups-v2 <dimension>\n\nRetrieves the distribution of DNS queries grouped by dimension over time."
		)
		.positional("dimension", {
			type: "string",
			description:
				"Specifies the attribute by which to group the results. Grouping by \`TLD_DNS_MAGNITUDE\` does not support sub-daily aggregation intervals; \`15m\` and \`1h\` are raised to \`1d\`.",
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
		.option("cache-hit", {
			type: "string",
			description: "Filters results based on cache status.",
		})
		.option("nodata", {
			type: "string",
			description:
				"Specifies whether the response includes empty DNS responses (NODATA).",
		})
		.option("protocol", {
			type: "string",
			description: "Filters results by DNS transport protocol.",
		})
		.option("query-type", {
			type: "string",
			description: "Filters results by DNS query type.",
		})
		.option("response-code", {
			type: "string",
			description: "Filters results by DNS response code.",
		})
		.option("response-ttl", {
			type: "string",
			description: "Filters results by DNS response TTL.",
		})
		.option("dnssec", {
			type: "string",
			description:
				"Filters results based on DNSSEC (DNS Security Extensions) support.",
		})
		.option("dnssec-aware", {
			type: "string",
			description:
				"Filters results based on DNSSEC (DNS Security Extensions) client awareness.",
		})
		.option("dnssec-e2e", {
			type: "string",
			description:
				"Filters results based on DNSSEC-validated answers by end-to-end security status.",
		})
		.option("ip-version", {
			type: "string",
			description: "Filters results by IP version (Ipv4 vs. IPv6).",
		})
		.option("limit-per-group", {
			type: "number",
			description:
				'Limits the number of objects per group to the top items within the specified time range. When item count exceeds the limit, extra items appear grouped under an "other" category. Only supported on high-cardinality dimensions; otherwise the request is rejected. Minimum value is 2.',
		})
		.option("matching-answer", {
			type: "string",
			description:
				"Filters results based on whether the queries have a matching answer.",
		})
		.option("tld", {
			type: "string",
			description:
				"Filters results by top-level domain. Incompatible with the `ipVersion`, `protocol`, `dnssecE2e`, `dnssecAware`, `responseTtl`, and `cacheHit` filters/dimensions; this restriction does not apply to country-code TLDs (2-letter, e.g. `uk`).",
		})
		.option("normalization", {
			type: "string",
			description:
				"Normalization method applied to the results. Refer to [Normalization methods](https://developers.cloudflare.com/radar/concepts/normalization/). `RANK` is only meaningful with the `TLD_DNS_MAGNITUDE` dimension, where it ranks TLDs by DNS query magnitude at each timestamp; for other dimensions it has no effect.",
			choices: ["PERCENTAGE", "MIN0_MAX", "RANK"],
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

type Request = SdkRequest<"radar-get-dns-timeseries-group">;
type Query = SdkQuery<"radar-get-dns-timeseries-group">;

const typedBuilder = withArgTypes<
	{
		"agg-interval": Query["aggInterval"];
		"cache-hit": Query["cacheHit"];
		nodata: Query["nodata"];
		protocol: Query["protocol"];
		"query-type": Query["queryType"];
		"response-code": Query["responseCode"];
		"response-ttl": Query["responseTtl"];
		dnssec: Query["dnssec"];
		"dnssec-aware": Query["dnssecAware"];
		"dnssec-e2e": Query["dnssecE2e"];
		"ip-version": Query["ipVersion"];
		"matching-answer": Query["matchingAnswer"];
		normalization: Query["normalization"];
		format: Query["format"];
		dimension: Request["dimension"];
	},
	typeof builder
>(builder);

type Args = InferArgs<typeof typedBuilder>;
const command: CommandModule<CommonYargsOptions, Args> = {
	command: "timeseries-groups-v2 <dimension>",
	describe: "Get DNS time series grouped by dimension",
	builder: typedBuilder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "radar dns timeseries-groups-v2",
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
					cacheHit: argv["cache-hit"],
					nodata: argv["nodata"],
					protocol: argv["protocol"],
					queryType: argv["query-type"],
					responseCode: argv["response-code"],
					responseTtl: argv["response-ttl"],
					dnssec: argv["dnssec"],
					dnssecAware: argv["dnssec-aware"],
					dnssecE2e: argv["dnssec-e2e"],
					ipVersion: argv["ip-version"],
					limitPerGroup: argv["limit-per-group"],
					matchingAnswer: argv["matching-answer"],
					tld: argv["tld"],
					normalization: argv["normalization"],
					format: argv["format"],
				};
				if (argv.dryRun) {
					formatDryRun({
						command: "cf radar dns timeseries-groups-v2",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/radar/dns/timeseries_groups/${argv["dimension"] == null ? "<dimension>" : encodeURIComponent(String(argv["dimension"]))}`,
						pathParams: { dimension: String(argv["dimension"] ?? "") },
						query: queryParams,
						bodyKind: "none",
					});
					return;
				}
				const client = await createCommandClient(argv);

				const result = await withProgress(`Loading`, async () =>
					client.radar.dns.timeseriesGroupsV2({
						dimension: argv["dimension"],
						...queryParams,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
};

export default command;
