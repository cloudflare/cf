/**
 * delete command
 * @generated from apis/overlays/stream.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"live-input-identifier": {
			kind: "parsed",
			brief: "A unique identifier for a live input.",
			parse: String,
		},
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
			placeholder: "output-identifier",
			brief: "A unique identifier for the output.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "delete <output-identifier>",
	describe: "Delete an output",
	usage:
		"$0 stream live-inputs outputs delete <output-identifier>\n\nDeletes an output and removes it from the associated live input.",
	...parameters,
	loader: () => import("./delete.handler.js"),
});

export default command;
