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
	describe: "Argo Analytics for a zone at different PoPs",
	usage:
		"$0 analytics latency colos get\n\nRetrieves Argo Smart Routing analytics broken down by geographic points of presence (PoPs). Shows latency improvements and routing efficiency per location.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
