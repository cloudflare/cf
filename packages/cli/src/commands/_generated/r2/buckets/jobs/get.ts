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
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [
		{
			placeholder: "job-id",
			brief: "Identifier returned when the background job was submitted.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <job-id>",
	describe: "Get Bucket Job",
	usage:
		"$0 r2 buckets jobs get <job-id>\n\nGets the current status of a background job of any type for an R2 bucket. Poll this endpoint with the job identifier returned by Create Bucket Job until the status is `COMPLETED`, `FAILED`, or `CANCELLED`.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
