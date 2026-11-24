/**
 * timeseries-groups command
 * @generated from apis/overlays/radar.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
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
		asn: {
			kind: "parsed",
			brief:
				"Filters results by Autonomous System. Specify one or more Autonomous System Numbers (ASNs) as a comma-separated list. Prefix with `-` to exclude ASNs from results. For example, `-174, 3356` excludes results from AS174, but includes results from AS3356.",
			variadic: true,
			optional: true,
			parse: String,
		},
		location: {
			kind: "parsed",
			brief:
				"Filters results by location. Specify a comma-separated list of alpha-2 codes. Prefix with `-` to exclude locations from results. For example, `-US,PT` excludes results from the US, but includes results from PT.",
			variadic: true,
			optional: true,
			parse: String,
		},
		continent: {
			kind: "parsed",
			brief:
				"Filters results by continent. Specify a comma-separated list of alpha-2 codes. Prefix with `-` to exclude continents from results. For example, `-EU,NA` excludes results from EU, but includes results from NA.",
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
		bot: {
			kind: "parsed",
			brief: "Filters results by bot name.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"bot-operator": {
			kind: "parsed",
			brief: "Filters results by bot operator.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"bot-category": {
			kind: "parsed",
			brief:
				"Filters results by bot category. `ACCESSIBILITY`, `AGGREGATOR`, `AI_SEARCH`, `ARCHIVER`, `SOCIAL_MEDIA_MARKETING` and `WEBHOOKS` are deprecated legacy categories that match only that exact category.",
			variadic: true,
			optional: true,
			choices: [
				"ACADEMIC_RESEARCH",
				"ADVERTISING_AND_MARKETING",
				"AI_ASSISTANT",
				"AI_CRAWLER",
				"COMMERCE",
				"FEED_FETCHER",
				"MONITORING_AND_ANALYTICS",
				"OTHER",
				"PAGE_PREVIEW",
				"SEARCH_ENGINE_CRAWLER",
				"SEARCH_ENGINE_OPTIMIZATION",
				"SECURITY",
				"ACCESSIBILITY",
				"AGGREGATOR",
				"AI_SEARCH",
				"ARCHIVER",
				"SOCIAL_MEDIA_MARKETING",
				"WEBHOOKS",
			],
			parse: String,
			coerce: (values: string[]) => values.flatMap((value) => value.split(",")),
		},
		"bot-kind": {
			kind: "parsed",
			brief:
				"Filters results by bot kind. Deprecated: the Verified Bot / Signed Agent distinction is being removed.",
			variadic: true,
			optional: true,
			choices: ["AGENT", "BOT"],
			parse: String,
			coerce: (values: string[]) => values.flatMap((value) => value.split(",")),
		},
		"bot-verification-status": {
			kind: "parsed",
			brief:
				"Filters results by bot verification status (Verified vs. Unverified).",
			variadic: true,
			optional: true,
			choices: ["VERIFIED"],
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
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "timeseries-groups <dimension>",
	describe: "Get time series distribution of bots HTTP requests by dimension.",
	usage:
		"$0 radar bots timeseries-groups <dimension>\n\nRetrieves the distribution of HTTP requests from bots, grouped by the specified dimension over time.",
	...parameters,
	loader: () => import("./timeseries-groups.handler.js"),
});

export default command;
