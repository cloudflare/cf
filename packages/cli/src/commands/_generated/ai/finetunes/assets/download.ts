/**
 * download command
 * @generated from apis/overlays/ai.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"finetune-id": { kind: "parsed", brief: "Finetune ID", parse: String },
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [{ placeholder: "file-name", brief: "File name", parse: String }],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "download <file-name>",
	describe: "Download a Finetune Asset",
	usage:
		"$0 ai finetunes assets download <file-name>\n\nReturns a pre-signed R2 URL for downloading a finetune asset file.",
	...parameters,
	loader: () => import("./download.handler.js"),
});

export default command;
