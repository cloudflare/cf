/**
 * disable command
 * @generated from apis/overlays/stream.ts
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
			placeholder: "live-input-identifier",
			brief: "A unique identifier for a live input.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "disable <live-input-identifier>",
	describe: "Disable a live input",
	usage:
		"$0 stream live-inputs disable <live-input-identifier>\n\nPrevents a live input from being streamed to and terminates any active broadcasts until re-enabled.",
	...parameters,
	loader: () => import("./disable.handler.js"),
});

export default command;
