/**
 * delete command
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
		force: {
			kind: "boolean",
			brief: "Skip confirmation (useful in scripts and CI)",
			alias: "f",
			default: false,
		},
	},
	operands: [
		{
			placeholder: "session-id",
			brief: "Browser session ID to close.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "delete <session-id>",
	describe: "Close browser session.",
	usage:
		"$0 browser-run devtools browser delete <session-id>\n\nCloses an existing browser session.",
	...parameters,
	loader: () => import("./delete.handler.js"),
});

export default command;
