/**
 * pre-check command
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
		region: {
			kind: "parsed",
			brief: "The region hint for the bucket (S3 only).",
			optional: true,
			parse: String,
		},
		secret: {
			kind: "parsed",
			brief:
				'Storage credentials for accessing the bucket. Provide as a JSON object or @path/to/file.json. Shape: {"<key>": unknown}.',
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
	command: "pre-check",
	describe: "Precheck source connectivity",
	usage:
		"$0 images import sources pre-check\n\nCheck S3 credentials without saving a source.",
	...parameters,
	loader: () => import("./pre-check.handler.js"),
});

export default command;
