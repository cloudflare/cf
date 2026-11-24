/**
 * get command
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
		"if-none-match": {
			kind: "parsed",
			brief:
				"Returns the object only if its ETag does not match the given value.",
			optional: true,
			parse: String,
		},
		"if-modified-since": {
			kind: "parsed",
			brief:
				"Returns the object only if it has been modified since the specified time.\nMust be formatted as an HTTP-date (RFC 7231), e.g. `Tue, 15 Jan 2024 10:30:00 GMT`.",
			optional: true,
			parse: String,
		},
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
			placeholder: "object-key",
			brief:
				"The key (name) of the object to retrieve. May contain slashes for path-like keys. Slashes (\`/\`) within the key MUST be sent literally and MUST NOT be percent-encoded (i.e. \`%2F\`); other reserved characters should be percent-encoded as usual.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <object-key>",
	describe: "Get Object",
	usage:
		"$0 r2 objects get <object-key>\n\nRetrieves an object from an R2 bucket. Returns the object body along with metadata headers. For most workloads, we recommend using R2's [S3-compatible API](https://developers.cloudflare.com/r2/api/s3/api/) or a [Worker with an R2 binding](https://developers.cloudflare.com/r2/api/workers/workers-api-reference/) instead.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
