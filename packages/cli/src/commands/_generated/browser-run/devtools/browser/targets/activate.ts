/**
 * activate command
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
		{
			placeholder: "target-id",
			brief: "Target ID to activate.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "activate <target-id>",
	describe: "Activate a browser target.",
	usage:
		"$0 browser-run devtools browser targets activate <target-id>\n\nActivates (brings to front) a specific browser target by its ID.",
	...parameters,
	loader: () => import("./activate.handler.js"),
});

export default command;
