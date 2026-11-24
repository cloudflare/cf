/**
 * create command
 * @generated from apis/overlays/stream.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"direct-user": {
			kind: "boolean",
			brief:
				"Provisions a URL to let your end users upload videos directly to Cloudflare Stream without exposing your API token to clients.",
			optional: true,
		},
		"tus-resumable": {
			kind: "parsed",
			brief:
				"Specifies the TUS protocol version. This value must be included in every upload request.\nNotes: The only supported version of TUS protocol is 1.0.0.",
			parse: String,
		},
		"upload-creator": {
			kind: "parsed",
			brief: "A user-defined identifier for the media creator.",
			optional: true,
			parse: String,
		},
		"upload-length": {
			kind: "parsed",
			brief:
				"Indicates the size of the entire upload in bytes. The value must be a non-negative integer.",
			parse: String,
		},
		"upload-metadata": {
			kind: "parsed",
			brief:
				"Comma-separated key-value pairs following the TUS protocol specification. Values are Base-64 encoded.\nSupported keys: `name`, `requiresignedurls`, `allowedorigins`, `thumbnailtimestamppct`, `watermark`, `scheduleddeletion`, `maxdurationseconds`, `encodingmode`.\n`encodingmode` accepts `default` or `previewFirst`.",
			optional: true,
			parse: String,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "create",
	describe: "Initiate video uploads using TUS",
	usage:
		"$0 stream videos create\n\nInitiates a video upload using the TUS protocol. On success, the server responds with a status code 201 (created) and includes a `location` header to indicate where the content should be uploaded. Refer to https://tus.io for protocol details.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;
