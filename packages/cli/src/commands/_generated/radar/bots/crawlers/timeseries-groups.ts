import operation from "../../../_operations/radar/bots/crawlers/timeseries-groups.js";
/**
 * timeseries-groups command
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
	command: "timeseries-groups <dimension>",
	describe: "Get time series of crawler HTTP request distribution by dimension",
	usage:
		"$0 radar bots crawlers timeseries-groups <dimension>\n\nRetrieves the distribution of HTTP requests from crawlers, grouped by the specified dimension over time.",
	flags: {
		"agg-interval": {
			kind: "enum",
			brief:
				"Aggregation interval of the results (e.g., in 15 minutes or 1 hour intervals). Refer to [Aggregation intervals](https://developers.cloudflare.com/radar/concepts/aggregation-intervals/). When omitted, the interval is auto-selected from the requested date range; finer intervals are only available for shorter ranges. If the requested interval is too granular for the date range, the request is rejected.",
			values: ["15m", "1h", "1d", "1w"],
			optional: true,
		},
		name: {
			kind: "parsed",
			brief: "Array of names used to label the series in the response.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"date-range": {
			kind: "parsed",
			brief:
				"Filters results by relative date range ending at the current time, with each value producing a separate series. Use `<n>d` for days (up to `364d`) or `<n>w` for weeks (up to `52w`). Append `control` to request the equivalent previous period for comparison: the comparison window is shifted back by the current window's length rounded up to a whole number of weeks, so it keeps the same weekday alignment and does not overlap the current window (e.g. `7dcontrol` covers days -14 to -7, `10dcontrol` covers days -24 to -14). For example, pass `7d` and `7dcontrol` to compare this week with the previous week. All series must resolve to the same duration as the main series; relative ranges (including `control`) satisfy this automatically. Use this parameter or set specific start and end dates (`dateStart` and `dateEnd` parameters).",
			variadic: true,
			optional: true,
			parse: String,
		},
		"date-start": {
			kind: "parsed",
			brief:
				"Start of the date range. Alternative to `dateRange`; provide together with `dateEnd`. When requesting comparison series, every series must resolve to the same duration as the main series. Each `dateStart`/`dateEnd` is floored to the nearest 15 minutes before evaluation, so windows whose durations match only before alignment may be rejected.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"date-end": {
			kind: "parsed",
			brief:
				"End of the date range (inclusive). Alternative to `dateRange`; provide together with `dateStart`. When requesting comparison series, every series must resolve to the same duration as the main series. Each `dateStart`/`dateEnd` is floored to the nearest 15 minutes before evaluation, so windows whose durations match only before alignment may be rejected.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"limit-per-group": {
			kind: "parsed",
			brief:
				'Limits the number of objects per group to the top items within the specified time range. When item count exceeds the limit, extra items appear grouped under an "other" category. Only supported on high-cardinality dimensions; otherwise the request is rejected. Minimum value is 2.',
			optional: true,
			parse: Number,
		},
		normalization: {
			kind: "enum",
			brief:
				"Normalization method applied to the results. Refer to [Normalization methods](https://developers.cloudflare.com/radar/concepts/normalization/). `PERCENTAGE_CHANGE` requires exactly one comparison series (e.g. a `control` date range).",
			values: ["PERCENTAGE", "MIN0_MAX", "PERCENTAGE_CHANGE"],
			optional: true,
		},
		"bot-operator": {
			kind: "parsed",
			brief: "Filters results by bot operator.",
			variadic: true,
			optional: true,
			parse: String,
		},
		vertical: {
			kind: "parsed",
			brief: "Filters results by vertical.",
			variadic: true,
			optional: true,
			parse: String,
		},
		industry: {
			kind: "parsed",
			brief: "Filters results by industry.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"client-type": {
			kind: "parsed",
			brief: "Filters results by agent type.",
			variadic: true,
			optional: true,
			choices: ["HUMAN", "NON_AI_BOT", "AI_BOT", "MIXED_PURPOSE"],
			parse: String,
			coerce: (values: string[]) => values.flatMap((value) => value.split(",")),
		},
		"response-status": {
			kind: "parsed",
			brief:
				"Filters results by HTTP response status code (e.g. 200, 403, 404). Only [IANA-registered codes](https://www.iana.org/assignments/http-status-codes/http-status-codes.xhtml) are accepted.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"response-status-category": {
			kind: "parsed",
			brief: "Filters results by HTTP response status code category.",
			variadic: true,
			optional: true,
			choices: [
				"INFORMATIONAL",
				"SUCCESS",
				"REDIRECTION",
				"CLIENT_ERROR",
				"SERVER_ERROR",
			],
			parse: String,
			coerce: (values: string[]) => values.flatMap((value) => value.split(",")),
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
	operands: [
		{
			placeholder: "dimension",
			brief: "Specifies the attribute by which to group the results.",
			parse: String,
		},
	],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "radar bots crawlers timeseries-groups",
				classification: {
					safeFlags: ["agg-interval", "normalization", "format", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
					aggInterval: argv["agg-interval"],
					name: argv["name"],
					dateRange: argv["date-range"],
					dateStart: argv["date-start"],
					dateEnd: argv["date-end"],
					limitPerGroup: argv["limit-per-group"],
					normalization: argv["normalization"],
					botOperator: argv["bot-operator"],
					vertical: argv["vertical"],
					industry: argv["industry"],
					clientType: argv["client-type"],
					responseStatus: argv["response-status"],
					responseStatusCategory: argv["response-status-category"],
					format: argv["format"],
				};
				if (argv.dryRun) {
					formatDryRun({
						command: "cf radar bots crawlers timeseries-groups",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/radar/bots/crawlers/timeseries_groups/${argv["dimension"] == null ? "<dimension>" : encodeURIComponent(String(argv["dimension"]))}`,
						pathParams: { dimension: String(argv["dimension"] ?? "") },
						query: queryParams,
						bodyKind: "none",
					});
					return;
				}
				const client = await createCommandClient(argv);

				const result = await withProgress(`Loading`, async () =>
					client.send(operation, {
						dimension: argv["dimension"],
						...queryParams,
					})
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
});

export default command;
