/**
 * get command
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
	command: "get <image-id>",
	describe: "Image details",
	usage: "$0 images get <image-id>\n\nFetch details for a CF Images image.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
