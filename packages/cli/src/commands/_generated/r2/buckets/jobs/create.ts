/**
 * create command
 * @generated from apis/overlays/r2.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";
import { resolveFileToken } from "#lib/input-validation.js";

const parameters = {
	flags: {
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
				"For prefix-delete jobs, set this header to reject the request when R2 Data Catalog is enabled for the bucket.",
			optional: true,
			parse: String,
		},
		"job-type": {
			kind: "parsed",
			brief: "The jobType field",
			optional: true,
			choices: ["prefixDelete", "storageClassMigration"],
			parse: String,
			coerce: (value: string) => resolveFileToken(value, "job-type", "text"),
		},
		prefix: {
			kind: "parsed",
			brief:
				"Prefix matched against object keys. A non-empty value must end in `/`.\nAn empty string empties the entire bucket.\n",
			optional: true,
			parse: String,
		},
		"destination-storage-class": {
			kind: "parsed",
			brief: "The destinationStorageClass field",
			optional: true,
			choices: ["Standard", "InfrequentAccess"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "destination-storage-class", "text"),
		},
		"source-storage-class": {
			kind: "parsed",
			brief: "The sourceStorageClass field",
			optional: true,
			choices: ["Standard", "InfrequentAccess"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "source-storage-class", "text"),
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
			brief: "Raw JSON request body (bypasses individual flags)",
			optional: true,
			parse: String,
		},
	},
	operands: [
		{ placeholder: "bucket-name", brief: "Name of the bucket.", parse: String },
	],
	rules(rules) {
		rules.conflicts("prefix", [
			"destination-storage-class",
			"source-storage-class",
		]);
		rules.conflicts("destination-storage-class", ["prefix"]);
		rules.conflicts("source-storage-class", ["prefix"]);
	},
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "create <bucket-name>",
	describe: "Create Bucket Job",
	usage:
		'$0 r2 buckets jobs create <bucket-name>\n\nCreates a background job for an R2 bucket. The `jobType` field selects the job: - **`prefixDelete`**: deletes every object whose key begins with `prefix`. A non-empty prefix must end in `/`. An empty prefix (`""`) empties the entire bucket. - **`storageClassMigration`**: migrates every object in the bucket between storage classes. `sourceStorageClass` and `destinationStorageClass` must be provided together and must differ; omitting both migrates from `InfrequentAccess` to `Standard`. Poll the returned `id` with the Get Bucket Job endpoint. Small prefix-delete jobs can finish synchronously and return `COMPLETED`. Objects uploaded after a background job starts are not affected by that job. For prefix-delete jobs: abort active multipart uploads before submitting the request, since a synchronously completed job does not abort them, and avoid writing objects or starting multipart uploads while a bucket-emptying job is in progress. Each request creates a distinct job, and the number of active prefix-delete jobs is limited per bucket; wait for an existing job to finish before retrying a request rejected with HTTP 429. A bucket cannot be emptied while event notifications are configured (HTTP 409 / error code 10083). To protect a bucket with R2 Data Catalog enabled, send the `cf-r2-data-catalog-check` header; a conflict is returned with HTTP 409 / error code 10081. Prefix-delete jobs require permission to delete objects; storage-class migration jobs require permission to write to the bucket.',
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;
