/**
 * put command
 * @generated from apis/overlays/r2.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"bucket-name": {
			kind: "parsed",
			brief: "Name of the bucket.",
			parse: String,
		},
		"cf-r2-jurisdiction": {
			kind: "parsed",
			brief:
				"Jurisdiction where objects in this bucket are guaranteed to be stored.",
			optional: true,
			parse: String,
		},
		"content-type": {
			kind: "parsed",
			brief: "The MIME type of the object being uploaded.",
			optional: true,
			parse: String,
		},
		"content-length": {
			kind: "parsed",
			brief: "The size of the object body in bytes.",
			optional: true,
			parse: String,
		},
		"cf-r2-storage-class": {
			kind: "parsed",
			brief: "Storage class for this object. Overrides the bucket default.",
			optional: true,
			parse: String,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		body: {
			kind: "parsed",
			brief: "The object body to upload.",
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
			placeholder: "object-key",
			brief:
				"The key (name) to assign to the object. May contain slashes for path-like keys. Slashes (\`/\`) within the key MUST be sent literally and MUST NOT be percent-encoded (i.e. \`%2F\`); other reserved characters should be percent-encoded as usual.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "put <object-key>",
	describe: "Upload Object",
	usage:
		"$0 r2 objects put <object-key>\n\nUploads an object to an R2 bucket. The object body is provided as the request body. Returns metadata about the uploaded object. The maximum upload size for this endpoint is 300 MB. For most workloads, we recommend using R2's [S3-compatible API](https://developers.cloudflare.com/r2/api/s3/api/) or a [Worker with an R2 binding](https://developers.cloudflare.com/r2/api/workers/workers-api-reference/) instead.",
	...parameters,
	loader: () => import("./put.handler.js"),
});

export default command;
