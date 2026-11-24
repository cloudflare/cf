/**
 * list command
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
		offset: {
			kind: "parsed",
			brief:
				"Skips the specified number of objects before fetching the results.",
			optional: true,
			parse: Number,
		},
		"date-range": {
			kind: "parsed",
			brief:
				"Filters results by a relative date range ending at the current time. Use `<n>d` for days (up to `364d`) or `<n>w` for weeks (up to `52w`), e.g. `7d`. Append `control` to request the equivalent previous period for comparison: the comparison window is shifted back by the current window's length rounded up to a whole number of weeks, so it keeps the same weekday alignment and does not overlap the current window (e.g. `3dcontrol` covers days -10 to -7, `7dcontrol` covers days -14 to -7, `28dcontrol` covers days -56 to -28, and `10dcontrol` covers days -24 to -14). Mutually exclusive with `dateStart`/`dateEnd`.",
			optional: true,
			parse: String,
		},
		"date-start": {
			kind: "parsed",
			brief:
				"Start of the date range (inclusive). Alternative to `dateRange`; provide together with `dateEnd`.",
			optional: true,
			parse: String,
		},
		"date-end": {
			kind: "parsed",
			brief:
				"End of the date range (inclusive). Alternative to `dateRange`; provide together with `dateStart`.",
			optional: true,
			parse: String,
		},
		status: {
			kind: "enum",
			brief: "Status",
			values: ["VERIFIED", "UNVERIFIED"],
			optional: true,
		},
		type: {
			kind: "parsed",
			brief: "Filters results by entity type (LOCATION, AS, or ORIGIN).",
			variadic: true,
			optional: true,
			choices: ["LOCATION", "AS", "ORIGIN"],
			parse: String,
			coerce: (values: string[]) => values.flatMap((value) => value.split(",")),
		},
		"data-source": {
			kind: "enum",
			brief: "Filters results by data source.",
			values: [
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
			optional: true,
		},
		asn: {
			kind: "parsed",
			brief:
				"Filters results by Autonomous System. Specify a single Autonomous System Number (ASN) as integer.",
			optional: true,
			parse: Number,
		},
		location: {
			kind: "parsed",
			brief: "Filters results by location. Specify an alpha-2 location code.",
			optional: true,
			parse: String,
		},
		origin: {
			kind: "parsed",
			brief: "Filters results by origin.",
			optional: true,
			parse: String,
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
	command: "list",
	describe: "Get latest Internet traffic anomalies",
	usage:
		"$0 radar traffic-anomalies list\n\nRetrieves the latest Internet traffic anomalies, which are signals that might indicate an outage. These alerts are automatically detected by Radar and manually verified by our team.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
