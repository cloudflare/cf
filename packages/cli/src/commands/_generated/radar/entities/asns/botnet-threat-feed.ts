/**
 * botnet-threat-feed command
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
		metric: {
			kind: "enum",
			brief: "Metric to rank ASNs by.",
			values: ["OFFENSE_COUNT", "NUMBER_OF_OFFENDING_IPS"],
			optional: true,
		},
		date: {
			kind: "parsed",
			brief:
				"The date to retrieve (YYYY-MM-DD format). If not specified, returns the most recent available data. Note: This is the date the report was generated. The report is generated from information collected from the previous day (e.g., the 2026-02-23 entry contains data from 2026-02-22).",
			optional: true,
			parse: String,
		},
		"compare-date-range": {
			kind: "parsed",
			brief:
				'Relative date range for rank change comparison (e.g., "1d", "7d", "30d").',
			optional: true,
			parse: String,
		},
		location: {
			kind: "parsed",
			brief: "Filters results by location. Specify an alpha-2 location code.",
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
		"sort-order": {
			kind: "enum",
			brief: "Sort order.",
			values: ["ASC", "DESC"],
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
	command: "botnet-threat-feed",
	describe: "Get AS rankings by botnet threat feed activity",
	usage:
		"$0 radar entities asns botnet-threat-feed\n\nRetrieves a ranked list of Autonomous Systems based on their presence in the Cloudflare Botnet Threat Feed. Rankings can be sorted by offense count or number of bad IPs. Optionally compare to a previous date to see rank changes.",
	...parameters,
	loader: () => import("./botnet-threat-feed.handler.js"),
});

export default command;
