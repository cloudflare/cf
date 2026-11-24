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
		arc: {
			kind: "parsed",
			brief:
				"Filters results by ARC (Authenticated Received Chain) validation.",
			variadic: true,
			optional: true,
			choices: ["PASS", "NONE", "FAIL"],
			parse: String,
			coerce: (values: string[]) => values.flatMap((value) => value.split(",")),
		},
		dkim: {
			kind: "parsed",
			brief:
				"Filters results by DKIM (DomainKeys Identified Mail) validation status.",
			variadic: true,
			optional: true,
			choices: ["PASS", "NONE", "FAIL"],
			parse: String,
			coerce: (values: string[]) => values.flatMap((value) => value.split(",")),
		},
		dmarc: {
			kind: "parsed",
			brief:
				"Filters results by DMARC (Domain-based Message Authentication, Reporting and Conformance) validation status.",
			variadic: true,
			optional: true,
			choices: ["PASS", "NONE", "FAIL"],
			parse: String,
			coerce: (values: string[]) => values.flatMap((value) => value.split(",")),
		},
		spf: {
			kind: "parsed",
			brief:
				"Filters results by SPF (Sender Policy Framework) validation status.",
			variadic: true,
			optional: true,
			choices: ["PASS", "NONE", "FAIL"],
			parse: String,
			coerce: (values: string[]) => values.flatMap((value) => value.split(",")),
		},
		"ip-version": {
			kind: "parsed",
			brief: "Filters results by IP version (Ipv4 vs. IPv6).",
			variadic: true,
			optional: true,
			choices: ["IPv4", "IPv6"],
			parse: String,
			coerce: (values: string[]) => values.flatMap((value) => value.split(",")),
		},
		encrypted: {
			kind: "parsed",
			brief:
				"Filters results by encryption status (encrypted vs. not-encrypted).",
			variadic: true,
			optional: true,
			choices: ["ENCRYPTED", "NOT_ENCRYPTED"],
			parse: String,
			coerce: (values: string[]) => values.flatMap((value) => value.split(",")),
		},
		"limit-per-group": {
			kind: "parsed",
			brief:
				'Limits the number of objects per group to the top items within the specified time range. When item count exceeds the limit, extra items appear grouped under an "other" category. Only supported on high-cardinality dimensions; otherwise the request is rejected. Minimum value is 2.',
			optional: true,
			parse: Number,
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
	describe: "Get email routing time series grouped by dimension",
	usage:
		"$0 radar email routing timeseries-groups <dimension>\n\nRetrieves the distribution of email routing metrics grouped by dimension over time.",
	...parameters,
	loader: () => import("./timeseries-groups.handler.js"),
});

export default command;
