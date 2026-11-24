/**
 * create command
 * @generated from apis/overlays/images.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";
import { resolveFileToken } from "#lib/input-validation.js";

const parameters = {
	flags: {
		account: {
			kind: "parsed",
			brief: "Account identifier for the bucket (required for R2 vendor).",
			optional: true,
			parse: String,
		},
		bucket: {
			kind: "parsed",
			brief: "The name of the storage bucket.",
			optional: true,
			parse: String,
		},
		name: {
			kind: "parsed",
			brief: "A human-readable name for the source.",
			optional: true,
			parse: String,
		},
		secret: {
			kind: "parsed",
			brief:
				'Storage credentials for accessing the bucket. Shape depends on vendor. Provide as a JSON object or @path/to/file.json. Shape: {"<key>": unknown}.',
			optional: true,
			parse: String,
		},
		vendor: {
			kind: "parsed",
			brief: "The cloud storage vendor of the source bucket.",
			optional: true,
			choices: ["s3", "r2"],
			parse: String,
			coerce: (value: string) => resolveFileToken(value, "vendor", "text"),
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		body: {
			kind: "parsed",
			brief: "Raw JSON request body (bypasses individual flags)",
			optional: true,
			parse: String,
		},
	},
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "create",
	describe: "Create a sourcing kit source",
	usage:
		"$0 images import sources create\n\nConfigure an S3 source for CF Images imports.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;
