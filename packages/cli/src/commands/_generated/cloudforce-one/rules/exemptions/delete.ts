/**
 * delete command
 * @generated from apis/overlays/cloudforce-one.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		namespace: {
			kind: "parsed",
			brief: "The namespace field",
			variadic: true,
			optional: true,
			parse: String,
		},
		"tag-match": {
			kind: "parsed",
			brief: "The tag_match field",
			variadic: true,
			optional: true,
			parse: String,
		},
		"worker-name": {
			kind: "parsed",
			brief: "The worker_name field",
			variadic: true,
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
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "delete",
	describe: "Remove patterns from exemption rules",
	usage:
		"$0 cloudforce-one rules exemptions delete\n\nRemove regex patterns from per-account exemption rules. Missing keys leave that type untouched; non-existent patterns are silently skipped.",
	...parameters,
	loader: () => import("./delete.handler.js"),
});

export default command;
