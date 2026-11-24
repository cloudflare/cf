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
			placeholder: "identifier",
			brief: "The unique identifier for a watermark profile.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "delete <identifier>",
	describe: "Delete watermark profiles",
	usage:
		"$0 stream watermarks delete <identifier>\n\nDeletes a watermark profile.",
	...parameters,
	loader: () => import("./delete.handler.js"),
});

export default command;
