/**
 * list command
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
		"per-page": {
			kind: "parsed",
			brief: "Maximum number of objects to return per page.",
			optional: true,
			parse: Number,
		},
		prefix: {
			kind: "parsed",
			brief:
				"Restricts results to only those objects whose keys begin with the specified prefix.",
			optional: true,
			parse: String,
		},
		delimiter: {
			kind: "parsed",
			brief:
				"A single character used to group keys. All keys that contain the delimiter between the prefix and the first occurrence of the delimiter after the prefix are grouped under a single result element.",
			optional: true,
			parse: String,
		},
		cursor: {
			kind: "parsed",
			brief:
				"Pagination cursor received from a previous List Objects call. Used to retrieve the next page of results.",
			optional: true,
			parse: String,
		},
		"start-after": {
			kind: "parsed",
			brief:
				"Returns objects with keys that come after the specified key in lexicographic order.",
			optional: true,
			parse: String,
		},
		"cf-r2-jurisdiction": {
			kind: "parsed",
			brief:
				"Jurisdiction where objects in this bucket are guaranteed to be stored.",
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
	command: "list",
	describe: "List Objects",
	usage:
		"$0 r2 objects list\n\nLists objects in an R2 bucket. Returns object metadata including key, size, etag, last modified date, HTTP metadata, and custom metadata. For most workloads, we recommend using R2's [S3-compatible API](https://developers.cloudflare.com/r2/api/s3/api/) or a [Worker with an R2 binding](https://developers.cloudflare.com/r2/api/workers/workers-api-reference/) instead.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
