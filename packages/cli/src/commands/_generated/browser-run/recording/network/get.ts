/**
 * get command
 * @generated from apis/overlays/browser-run.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		format: {
			kind: "parsed",
			brief: "Set to `har` to return a HAR JSON document.",
			optional: true,
			parse: String,
		},
		target: {
			kind: "parsed",
			brief: "Target ID to include in the response.",
			parse: String,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [
		{ placeholder: "session-id", brief: "Session ID.", parse: String },
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <session-id>",
	describe: "Get network recording data.",
	usage:
		"$0 browser-run recording network get <session-id>\n\nReturns network recording events for the requested target ID. Use ?format=har for a HAR JSON document.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
