/**
 * origin command
 * @generated from apis/overlays/radar.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		limit: {
			kind: "parsed",
			brief: "Limits the number of objects returned in the response.",
			optional: true,
			parse: Number,
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
		"ip-version": {
			kind: "parsed",
			brief: "Filters results by IP version (Ipv4 vs. IPv6).",
			variadic: true,
			optional: true,
			choices: ["IPv4", "IPv6"],
			parse: String,
			coerce: (values: string[]) => values.flatMap((value) => value.split(",")),
		},
		"http-version": {
			kind: "parsed",
			brief: "Filters results by HTTP version.",
			variadic: true,
			optional: true,
			choices: ["HTTPv1", "HTTPv2", "HTTPv3"],
			parse: String,
			coerce: (values: string[]) => values.flatMap((value) => value.split(",")),
		},
		"http-method": {
			kind: "parsed",
			brief: "Filters results by HTTP method.",
			variadic: true,
			optional: true,
			choices: [
				"GET",
				"POST",
				"DELETE",
				"PUT",
				"HEAD",
				"PURGE",
				"OPTIONS",
				"PROPFIND",
				"MKCOL",
				"PATCH",
				"ACL",
				"BCOPY",
				"BDELETE",
				"BMOVE",
				"BPROPFIND",
				"BPROPPATCH",
				"CHECKIN",
				"CHECKOUT",
				"CONNECT",
				"COPY",
				"LABEL",
				"LOCK",
				"MERGE",
				"MKACTIVITY",
				"MKWORKSPACE",
				"MOVE",
				"NOTIFY",
				"ORDERPATCH",
				"POLL",
				"PROPPATCH",
				"REPORT",
				"SEARCH",
				"SUBSCRIBE",
				"TRACE",
				"UNCHECKOUT",
				"UNLOCK",
				"UNSUBSCRIBE",
				"UPDATE",
				"VERSIONCONTROL",
				"BASELINECONTROL",
				"XMSENUMATTS",
				"RPC_OUT_DATA",
				"RPC_IN_DATA",
				"JSON",
				"COOK",
				"TRACK",
			],
			parse: String,
			coerce: (values: string[]) => values.flatMap((value) => value.split(",")),
		},
		"mitigation-product": {
			kind: "parsed",
			brief: "Filters the results by layer 7 mitigation product.",
			variadic: true,
			optional: true,
			choices: [
				"DDOS",
				"WAF",
				"BOT_MANAGEMENT",
				"ACCESS_RULES",
				"IP_REPUTATION",
				"API_SHIELD",
				"DATA_LOSS_PREVENTION",
			],
			parse: String,
			coerce: (values: string[]) => values.flatMap((value) => value.split(",")),
		},
		"as-category": {
			kind: "parsed",
			brief:
				"Filters results by the inferred network type of the Autonomous System: `ACCESS_ISP` (networks connecting end users, plus transit), `HOSTING_CLOUD_CONTENT` (hosting providers, clouds and CDNs), `ORGANIZATION` (enterprises, universities, governments, banks and IXP route servers), or `UNCLASSIFIED` (the AS isn't classified, or the traffic couldn't be mapped to an AS). In HTTP, only supported for date ranges starting on or after 2023-05-01.",
			variadic: true,
			optional: true,
			choices: [
				"ACCESS_ISP",
				"HOSTING_CLOUD_CONTENT",
				"ORGANIZATION",
				"UNCLASSIFIED",
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
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "origin",
	describe: "Get top origin ASes of layer 7 attacks",
	usage:
		"$0 radar attacks layer7 top ases origin\n\nRetrieves the top origin autonomous systems of layer 7 attacks. Values are percentages of the total layer 7 attacks, with the origin autonomous systems determined by the client IP address.",
	...parameters,
	loader: () => import("./origin.handler.js"),
});

export default command;
