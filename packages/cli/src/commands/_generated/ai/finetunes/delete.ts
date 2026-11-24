/**
 * delete command
 * @generated from apis/overlays/ai.ts
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
		{ placeholder: "finetune-id", brief: "Finetune ID", parse: String },
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "delete <finetune-id>",
	describe: "Delete a Finetune",
	usage:
		"$0 ai finetunes delete <finetune-id>\n\nDelete a finetune. Any in-flight requests referencing the lora will fail after the files are deleted.",
	...parameters,
	loader: () => import("./delete.handler.js"),
});

export default command;
