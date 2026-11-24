/**
 * version command
 * @generated from apis/overlays/browser-run.ts
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
	operands: [
		{ placeholder: "session-id", brief: "Browser session ID.", parse: String },
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "version <session-id>",
	describe: "Get browser version metadata.",
	usage:
		"$0 browser-run devtools browser version <session-id>\n\nGet browser version metadata.",
	...parameters,
	loader: () => import("./version.handler.js"),
});

export default command;
