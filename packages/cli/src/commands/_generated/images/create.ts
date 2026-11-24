/**
 * create command
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
		body: {
			kind: "parsed",
			brief: "Raw JSON request body (bypasses individual flags)",
			optional: true,
			parse: String,
		},
		file: {
			kind: "parsed",
			brief: "Path to a file to upload as the request body",
			optional: true,
			parse: String,
		},
		creator: {
			kind: "parsed",
			brief: "Can set the creator field with an internal user ID.",
			optional: true,
			parse: String,
		},
		id: {
			kind: "parsed",
			brief: "An optional custom unique identifier for your image.",
			optional: true,
			parse: String,
		},
		metadata: {
			kind: "parsed",
			brief:
				"User modifiable key-value store. Can use used for keeping references to another system of record for managing images.",
			optional: true,
			parse: String,
		},
		"require-signed-urls": {
			kind: "boolean",
			brief:
				"Indicates whether the image requires a signature token for the access.",
			optional: true,
		},
		url: {
			kind: "parsed",
			brief:
				"A URL to fetch an image from origin. Only needed when type is uploading from a URL.",
			optional: true,
			parse: String,
		},
	},
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "create",
	describe: "Upload an image",
	usage:
		"$0 images create\n\nUpload an image to CF Images. Images up to 10 Megabytes can be uploaded using a single HTTP POST (multipart/form-data) request by sending an image file or passing a URL accessible to the API.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;
