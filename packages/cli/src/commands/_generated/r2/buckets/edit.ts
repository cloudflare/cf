/**
 * edit command
 * @generated from apis/overlays/r2.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"cf-r2-jurisdiction": {
			kind: "parsed",
			brief:
				"Jurisdiction where objects in this bucket are guaranteed to be stored.",
			optional: true,
			parse: String,
		},
		"cf-r2-storage-class": {
			kind: "parsed",
			brief:
				"Storage class for newly uploaded objects, unless specified otherwise.",
			parse: String,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [
		{ placeholder: "bucket-name", brief: "Name of the bucket.", parse: String },
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "edit <bucket-name>",
	describe: "Patch Bucket",
	usage:
		"$0 r2 buckets edit <bucket-name>\n\nChanges the default storage class for newly uploaded objects in an existing R2 bucket. Existing objects retain their storage class, and individual uploads can override the bucket default.",
	...parameters,
	loader: () => import("./edit.handler.js"),
});

export default command;
