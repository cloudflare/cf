/**
 * delete command
 * @generated from apis/overlays/logpush.ts
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
			placeholder: "transformer-id",
			brief: "The transformer ID.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "delete <transformer-id>",
	describe: "Delete transformer",
	usage:
		"$0 logpush transformers delete <transformer-id>\n\nDeletes a custom log transformer. Returns 409 Conflict if any active logpush jobs reference the transformer.",
	...parameters,
	loader: () => import("./delete.handler.js"),
});

export default command;
