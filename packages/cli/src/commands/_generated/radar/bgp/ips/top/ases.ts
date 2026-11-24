/**
 * ases command
 * @generated from apis/overlays/radar.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		date: {
			kind: "parsed",
			brief: "Filters results by the specified datetime (ISO 8601).",
			optional: true,
			parse: String,
		},
		limit: {
			kind: "parsed",
			brief: "Limits the number of objects returned in the response.",
			optional: true,
			parse: Number,
		},
		metric: {
			kind: "enum",
			brief: "Ranking metric: IPv4 /24 count or IPv6 /48 count.",
			values: ["v4_24s", "v6_48s"],
			optional: true,
		},
		country: {
			kind: "parsed",
			brief:
				"Optional ISO 3166-1 alpha-2 country filter. Omit for global top-N.",
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
	command: "ases",
	describe: "Get top ASes by announced IP space",
	usage:
		"$0 radar bgp ips top ases\n\nReturns the top-N autonomous systems by announced IP space at the nearest 8-hour RIB boundary at or before the requested date. The snapped boundary is returned as `anchor_ts`.",
	...parameters,
	loader: () => import("./ases.handler.js"),
});

export default command;
