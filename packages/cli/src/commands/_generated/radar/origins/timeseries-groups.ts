import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkQuery, SdkRequest } from "#sdk";
/**
 * timeseries-groups command
 * @generated from apis/overlays/radar.ts
 */
import type { Argv, CommandModule } from "yargs";
import { createCommandClient } from "#lib/auth.js";
import { withArgTypes } from "#lib/cli-types.js";
import { formatDryRun } from "#lib/dry-run.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 radar origins timeseries-groups <dimension>\n\nRetrieves the distribution of origin metrics grouped by the specified dimension over time."
		)
		.positional("dimension", {
			type: "string",
			description:
				"Specifies the origin attribute by which to group the results. \`ORIGIN\` groups across all providers and does not accept an \`origin\` or \`region\`. \`REGION\` requires an \`origin\`. \`SUCCESS_RATE\` and \`PERCENTILE\` require both an \`origin\` and a \`region\` and constrain the \`metric\` (\`SUCCESS_RATE\` supports only \`REQUESTS\`; \`PERCENTILE\` supports any metric except \`REQUESTS\`). \`limitPerGroup\` is only supported on the \`REGION\` dimension.",
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
		.option("limit-per-group", {
			type: "number",
			description:
				'Limits the number of objects per group to the top items within the specified time range. When item count exceeds the limit, extra items appear grouped under an "other" category. Only supported on high-cardinality dimensions; otherwise the request is rejected. Minimum value is 2.',
		})
		.option("origin", {
			type: "string",
			description:
				"Filters results by origin. Required for every dimension except `ORIGIN`; must not be set on the `ORIGIN` dimension, which groups across all providers.",
		})
		.option("metric", {
			type: "string",
			description:
				"Specifies the metric to retrieve. Allowed metrics depend on the selected dimension (see the `dimension` path parameter).",
			choices: [
				"CONNECTION_FAILURES",
				"REQUESTS",
				"RESPONSE_HEADER_RECEIVE_DURATION",
				"TCP_HANDSHAKE_DURATION",
				"TCP_RTT",
				"TLS_HANDSHAKE_DURATION",
			],
			demandOption: true,
		})
		.option("region", {
			type: "string",
			description:
				"Filters results by origin region. Requires `origin` to be set and is validated against it.",
		})
		.option("normalization", {
			type: "string",
			description:
				"Normalization method applied to the results. Refer to [Normalization methods](https://developers.cloudflare.com/radar/concepts/normalization/).",
			choices: ["PERCENTAGE", "MIN0_MAX"],
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

type Request = SdkRequest<"radar-get-origins-timeseries-group">;
type Query = SdkQuery<"radar-get-origins-timeseries-group">;

const typedBuilder = withArgTypes<
	{
		"agg-interval": Query["aggInterval"];
		origin: Query["origin"];
		metric: Query["metric"];
		normalization: Query["normalization"];
		format: Query["format"];
		dimension: Request["dimension"];
	},
	typeof builder
>(builder);

type Args = InferArgs<typeof typedBuilder>;
const command: CommandModule<CommonYargsOptions, Args> = {
	command: "timeseries-groups <dimension>",
	describe: "Get origin metrics time series grouped by dimension",
	builder: typedBuilder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "radar origins timeseries-groups",
				classification: {
					safeFlags: [
						"agg-interval",
						"metric",
						"normalization",
						"format",
						"dry-run",
					],
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
					limitPerGroup: argv["limit-per-group"],
					origin: argv["origin"],
					metric: argv["metric"],
					region: argv["region"],
					normalization: argv["normalization"],
					format: argv["format"],
				};
				if (argv.dryRun) {
					formatDryRun({
						command: "cf radar origins timeseries-groups",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/radar/origins/timeseries_groups/${argv["dimension"] == null ? "<dimension>" : encodeURIComponent(String(argv["dimension"]))}`,
						pathParams: { dimension: String(argv["dimension"] ?? "") },
						query: queryParams,
						bodyKind: "none",
					});
					return;
				}
				const client = await createCommandClient(argv);

				const result = await withProgress(`Loading`, async () =>
					client.radar.origins.timeseriesGroups({
						dimension: argv["dimension"],
						...queryParams,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
};

export default command;
