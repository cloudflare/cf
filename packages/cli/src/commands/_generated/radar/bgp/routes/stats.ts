/**
 * stats command
 * @generated from apis/overlays/radar.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
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
	command: "stats",
	describe: "Get BGP routing table stats",
	usage: "$0 radar bgp routes stats\n\nRetrieves the BGP routing table stats.",
	...parameters,
	loader: () => import("./stats.handler.js"),
});

export default command;
