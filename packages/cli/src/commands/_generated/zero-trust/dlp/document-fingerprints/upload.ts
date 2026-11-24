/**
 * upload command
 * @generated from apis/overlays/zero-trust.ts
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
			brief: "File used for document fingerprinting.",
			optional: true,
			parse: String,
		},
		file: {
			kind: "parsed",
			brief: "Path to a file to upload as the request body",
			optional: true,
			parse: String,
		},
	},
	operands: [
		{
			placeholder: "document-fingerprint-id",
			brief: "Document fingerprint ID",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "upload <document-fingerprint-id>",
	describe: "Uploads a new version for a document fingerprint.",
	usage:
		"$0 zero-trust dlp document-fingerprints upload <document-fingerprint-id>\n\nUploads a new document to create or update a fingerprint. The document structure is analyzed to enable detection of similar documents.",
	...parameters,
	loader: () => import("./upload.handler.js"),
});

export default command;
