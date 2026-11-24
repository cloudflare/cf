/**
 * delete command
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
		force: {
			kind: "boolean",
			brief: "Skip confirmation (useful in scripts and CI)",
			alias: "f",
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
	command: "delete <image-id>",
	describe: "Delete image",
	usage:
		"$0 images delete <image-id>\n\nDelete an image on Cloudflare Images. On success, all copies of the image are deleted and purged from cache.",
	...parameters,
	loader: () => import("./delete.handler.js"),
});

export default command;
