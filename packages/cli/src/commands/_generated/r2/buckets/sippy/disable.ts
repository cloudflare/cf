/**
 * disable command
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
	},
	operands: [
		{ placeholder: "bucket-name", brief: "Name of the bucket.", parse: String },
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "disable <bucket-name>",
	describe: "Disable Sippy",
	usage:
		"$0 r2 buckets sippy disable <bucket-name>\n\nDisables Sippy on-demand migration for an R2 bucket. Requests no longer fetch missing objects from the source storage provider. Objects already copied to R2 remain in the bucket.",
	...parameters,
	loader: () => import("./disable.handler.js"),
});

export default command;
