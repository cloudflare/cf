/**
 * get command
 * @generated from apis/overlays/spectrum.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		since: { kind: "parsed", brief: "Since", optional: true, parse: String },
		until: { kind: "parsed", brief: "Until", optional: true, parse: String },
		"cdn-traffic": {
			kind: "boolean",
			brief: "Include CDN traffic in the bandwidth aggregation.",
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
	command: "get",
	describe: "Get zones bandwidth report",
	usage:
		"$0 spectrum analytics zones report get\n\nRetrieves a list of total bandwidth by zone over a given time period.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
