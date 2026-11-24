/**
 * target command
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
		bucket: {
			kind: "parsed",
			brief: "The bucket field",
			optional: true,
			parse: String,
		},
		jurisdiction: {
			kind: "parsed",
			brief: "The jurisdiction field",
			optional: true,
			choices: ["default", "eu", "us", "fedramp"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "jurisdiction", "text"),
		},
		"secret-access-key-id": {
			kind: "parsed",
			brief: "The secret.accessKeyId field",
			optional: true,
			parse: String,
		},
		"secret-secret-access-key": {
			kind: "parsed",
			brief: "The secret.secretAccessKey field",
			optional: true,
			parse: String,
		},
		vendor: {
			kind: "parsed",
			brief: "The vendor field",
			optional: true,
			choices: ["r2"],
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
	command: "target",
	describe: "Check target connectivity",
	usage:
		"$0 r2 super-slurper connectivity-precheck target\n\nCheck whether tokens are valid against the target bucket",
	...parameters,
	loader: () => import("./target.handler.js"),
});

export default command;
