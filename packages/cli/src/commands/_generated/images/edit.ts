/**
 * edit command
 * @generated from apis/overlays/images.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		creator: {
			kind: "parsed",
			brief: "Can set the creator field with an internal user ID.",
			optional: true,
			parse: String,
		},
		metadata: {
			kind: "parsed",
			brief:
				'User modifiable key-value store. Can be used for keeping references to another system of record for managing images. No change if not specified. Provide as a JSON object or @path/to/file.json. Shape: {"<key>": unknown}.',
			optional: true,
			parse: String,
		},
		"require-signed-urls": {
			kind: "boolean",
			brief:
				"Indicates whether the image can be accessed using only its UID. If set to `true`, a signed token needs to be generated with a signing key to view the image. Returns a new UID on a change. No change if not specified.",
			optional: true,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		body: {
			kind: "parsed",
			brief: "Raw JSON request body (bypasses individual flags)",
			optional: true,
			parse: String,
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
	command: "edit <image-id>",
	describe: "Update image",
	usage:
		"$0 images edit <image-id>\n\nUpdate a CF Images image's metadata, creator, or access control. On access control change, all copies of the image are purged from cache.",
	...parameters,
	loader: () => import("./edit.handler.js"),
});

export default command;
