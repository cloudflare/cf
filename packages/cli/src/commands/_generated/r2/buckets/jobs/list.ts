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
		"job-type": {
			kind: "enum",
			brief: "Restricts results to jobs of the specified type.",
			values: ["prefixDelete", "storageClassMigration"],
			optional: true,
		},
		status: {
			kind: "enum",
			brief:
				"Restricts results to jobs with the specified status. `jobType` is required when this parameter is provided.",
			values: ["ENQUEUED", "RUNNING", "COMPLETED", "FAILED", "CANCELLED"],
			optional: true,
		},
		"max-keys": {
			kind: "parsed",
			brief: "Maximum number of jobs to return.",
			optional: true,
			parse: Number,
		},
		"continuation-token": {
			kind: "parsed",
			brief:
				"Pagination token received as `nextContinuationToken` in the previous response.",
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
	describe: "List Bucket Jobs",
	usage:
		"$0 r2 buckets jobs list\n\nLists background jobs for an R2 bucket, including prefix-delete (and bucket-emptying) jobs and storage-class migration jobs. Jobs of every type are returned unless `jobType` is provided.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
