/**
 * realtime command
 * @generated from apis/overlays/radar.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		prefix: { kind: "parsed", brief: "Prefix", optional: true, parse: String },
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
	command: "realtime",
	describe: "Get real-time BGP routes for a prefix",
	usage:
		"$0 radar bgp routes realtime\n\nRetrieves real-time BGP routes for a prefix, using public real-time data collectors (RouteViews and RIPE RIS).",
	...parameters,
	loader: () => import("./realtime.handler.js"),
});

export default command;
