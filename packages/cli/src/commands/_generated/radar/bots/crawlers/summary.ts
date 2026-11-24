/**
 * summary command
 * @generated from apis/overlays/radar.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
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
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "summary <dimension>",
	describe: "Get crawler HTTP request distribution by dimension",
	usage:
		"$0 radar bots crawlers summary <dimension>\n\nRetrieves an aggregated summary of HTTP requests from crawlers, grouped by the specified dimension.",
	...parameters,
	loader: () => import("./summary.handler.js"),
});

export default command;
