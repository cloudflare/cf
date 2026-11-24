/**
 * close command
 * @generated from apis/overlays/browser-run.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"session-id": {
			kind: "parsed",
			brief: "Browser session ID.",
			parse: String,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [
		{ placeholder: "target-id", brief: "Target ID to close.", parse: String },
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "close <target-id>",
	describe: "Close a browser target.",
	usage:
		"$0 browser-run devtools browser targets close <target-id>\n\nCloses a specific browser target (tab, page, etc.) by its ID. Returns 'Target is closing' on success or an error if the target is not found.",
	...parameters,
	loader: () => import("./close.handler.js"),
});

export default command;
