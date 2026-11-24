/**
 * update command
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
		rules: {
			kind: "parsed",
			brief:
				'The rules field. Provide as a JSON array of objects or @path/to/file.json. Shape: [{"condition": {...}, "enabled": boolean, "id": string, "prefix"?: string}]. ? marks optional keys.',
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
			brief: "Raw JSON request body (bypasses individual flags)",
			optional: true,
			parse: String,
		},
	},
	operands: [
		{ placeholder: "bucket-name", brief: "Name of the bucket.", parse: String },
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "update <bucket-name>",
	describe: "Set Bucket Lock Rules",
	usage:
		"$0 r2 buckets locks update <bucket-name>\n\nReplaces the lock rules for an R2 bucket. Enabled rules prevent matching objects from being overwritten or deleted for a duration, until a date, or indefinitely. Rules apply to existing and newly uploaded objects.",
	...parameters,
	loader: () => import("./update.handler.js"),
});

export default command;
