/**
 * histogram command
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
		"bucket-size": {
			kind: "parsed",
			brief: "Specifies the width for every bucket in the histogram.",
			optional: true,
			parse: Number,
		},
		"metric-group": {
			kind: "enum",
			brief: "Metrics to be returned.",
			values: ["BANDWIDTH", "LATENCY", "JITTER"],
			optional: true,
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
	command: "histogram",
	describe: "Get speed tests histogram",
	usage:
		"$0 radar quality speed histogram\n\nRetrieves a histogram from the previous 90 days of Cloudflare Speed Test data, split into fixed bandwidth (Mbps), latency (ms), or jitter (ms) buckets.",
	...parameters,
	loader: () => import("./histogram.handler.js"),
});

export default command;
