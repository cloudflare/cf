/**
 * create command
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
		body: {
			kind: "parsed",
			brief: "Finetune asset file upload.",
			optional: true,
			parse: String,
		},
		file: {
			kind: "parsed",
			brief: "Path to a file to upload as the request body",
			optional: true,
			parse: String,
		},
		"file-name": {
			kind: "parsed",
			brief:
				"Name of the file (adapter_config.json or adapter_model.safetensors).",
			optional: true,
			parse: String,
		},
	},
	operands: [
		{ placeholder: "finetune-id", brief: "Finetune ID", parse: String },
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "create <finetune-id>",
	describe: "Upload a Finetune Asset",
	usage:
		"$0 ai finetunes assets create <finetune-id>\n\nUploads training data assets for a Workers AI fine-tuning job.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;
