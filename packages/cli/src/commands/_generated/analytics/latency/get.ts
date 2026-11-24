/**
 * get command
 * @generated from apis/overlays/analytics.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		bins: { kind: "parsed", brief: "Bins", optional: true, parse: String },
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
	describe: "Argo Analytics for a zone",
	usage:
		"$0 analytics latency get\n\nRetrieves aggregate Argo Smart Routing analytics for a zone, including latency improvements, bandwidth savings, and routing statistics.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
