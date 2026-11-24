/**
 * get-blob command
 * @generated from apis/overlays/images.ts
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
		text: {
			kind: "boolean",
			brief:
				"Decode the response body as UTF-8 text instead of writing raw bytes",
			default: false,
		},
	},
	operands: [
		{
			placeholder: "image-id",
			brief: "Image unique identifier.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get-blob <image-id>",
	describe: "Download image",
	usage:
		"$0 images get-blob <image-id>\n\nDownload an image from CF Images. For most images this will be the originally uploaded file. For larger images it can be a near-lossless version of the original.",
	...parameters,
	loader: () => import("./get-blob.handler.js"),
});

export default command;
