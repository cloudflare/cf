/**
 * direct-upload command
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
		expiry: {
			kind: "parsed",
			brief:
				"The date after which the upload will not be accepted. Minimum: Now + 2 minutes. Maximum: Now + 6 hours.",
			optional: true,
			parse: String,
		},
		id: {
			kind: "parsed",
			brief:
				"Optional Image Custom ID. Up to 1024 chars. Can include any number of subpaths, and utf8 characters. Cannot start nor end with a / (forward slash). Cannot be a UUID.",
			optional: true,
			parse: String,
		},
		metadata: {
			kind: "parsed",
			brief:
				"User modifiable key-value store. Can be used for keeping references to another system of record, for managing images.",
			optional: true,
			parse: String,
		},
		"require-signed-urls": {
			kind: "boolean",
			brief:
				"Indicates whether the image requires a signature token to be accessed.",
			optional: true,
		},
	},
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "direct-upload",
	describe: "Create authenticated direct upload URL V2",
	usage:
		"$0 images direct-upload\n\nDirect uploads allow users to upload images without API keys. A common use case are web apps, client-side applications, or mobile devices where users upload content directly to Cloudflare Images. This method creates a draft record for a future image. It returns an upload URL and an image identifier. To verify if the image itself has been uploaded, send an image details request (accounts/:account_identifier/images/v1/:identifier), and check that the `draft: true` property is not present.",
	...parameters,
	loader: () => import("./direct-upload.handler.js"),
});

export default command;
