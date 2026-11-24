/**
 * bulk-delete command
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
		prefix: {
			kind: "parsed",
			brief:
				"Deprecated. Create a `prefixDelete` job with the Create Bucket Job endpoint instead.\nWhen present, the request body is ignored and a prefix-delete job is created for this\nprefix, exactly as Create Bucket Job does; an empty value empties the bucket. The\nresponse is the job descriptor, with a `Deprecation` header and a deprecation message\nin `messages`.",
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
		"cf-r2-data-catalog-check": {
			kind: "parsed",
			brief:
				"Set this header to reject the operation when R2 Data Catalog is enabled for the bucket.",
			optional: true,
			parse: String,
		},
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
		body: {
			kind: "parsed",
			brief:
				"A JSON array of 1 to 1000 object keys to delete. Required unless the deprecated `prefix` parameter is present.",
			optional: true,
			parse: String,
		},
	},
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "bulk-delete",
	describe: "Delete Objects",
	usage:
		"$0 r2 objects bulk-delete\n\nDeletes the listed objects from an R2 bucket. Provide a JSON array of 1 to 1000 object keys in the request body. If any key cannot be deleted (for example, because it does not exist or is locked), the remaining keys are still deleted, but the response is HTTP 200 with `success: false`, `result: null` and one entry in `errors` per failed key. The entries in `errors` do not identify which key failed. To delete every object under a prefix, or to empty a bucket, create a `prefixDelete` job with the Create Bucket Job endpoint instead. The `prefix` query parameter on this endpoint is deprecated; it creates the same job, but responses to it carry a `Deprecation` header and a message pointing to Create Bucket Job. For most workloads, we recommend using R2's [S3-compatible API](https://developers.cloudflare.com/r2/api/s3/api/) or a [Worker with an R2 binding](https://developers.cloudflare.com/r2/api/workers/workers-api-reference/) instead.",
	...parameters,
	loader: () => import("./bulk-delete.handler.js"),
});

export default command;
