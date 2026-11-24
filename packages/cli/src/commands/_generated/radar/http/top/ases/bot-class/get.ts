/**
 * get command
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
		"geo-id": {
			kind: "parsed",
			brief:
				"Filters results by Geolocation. Specify a comma-separated list of GeoNames IDs. Prefix with `-` to exclude geoIds from results. For example, `-2267056,360689` excludes results from the 2267056 (Lisbon), but includes results from 5128638 (New York).",
			variadic: true,
			optional: true,
			parse: String,
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
		"device-type": {
			kind: "parsed",
			brief: "Filters results by device type.",
			variadic: true,
			optional: true,
			choices: ["DESKTOP", "MOBILE", "OTHER"],
			parse: String,
			coerce: (values: string[]) => values.flatMap((value) => value.split(",")),
		},
		"http-protocol": {
			kind: "parsed",
			brief: "Filters results by HTTP protocol (HTTP vs. HTTPS).",
			variadic: true,
			optional: true,
			choices: ["HTTP", "HTTPS"],
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
		"ip-version": {
			kind: "parsed",
			brief: "Filters results by IP version (Ipv4 vs. IPv6).",
			variadic: true,
			optional: true,
			choices: ["IPv4", "IPv6"],
			parse: String,
			coerce: (values: string[]) => values.flatMap((value) => value.split(",")),
		},
		os: {
			kind: "parsed",
			brief: "Filters results by operating system.",
			variadic: true,
			optional: true,
			choices: [
				"WINDOWS",
				"MACOSX",
				"IOS",
				"ANDROID",
				"CHROMEOS",
				"LINUX",
				"SMART_TV",
			],
			parse: String,
			coerce: (values: string[]) => values.flatMap((value) => value.split(",")),
		},
		"tls-version": {
			kind: "parsed",
			brief: "Filters results by TLS version.",
			variadic: true,
			optional: true,
			choices: ["TLSv1_0", "TLSv1_1", "TLSv1_2", "TLSv1_3", "TLSvQUIC"],
			parse: String,
			coerce: (values: string[]) => values.flatMap((value) => value.split(",")),
		},
		"browser-family": {
			kind: "parsed",
			brief: "Filters results by browser family.",
			variadic: true,
			optional: true,
			choices: ["CHROME", "EDGE", "FIREFOX", "SAFARI"],
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
			placeholder: "bot-class",
			brief:
				"Bot class. Refer to [Bot classes](https://developers.cloudflare.com/radar/concepts/bot-classes/).",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <bot-class>",
	describe: "Get top ASes by HTTP requests for a bot class",
	usage:
		"$0 radar http top ases bot-class get <bot-class>\n\nRetrieves the top autonomous systems, by HTTP requests, of the requested bot class.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
