/**
 * bulk-delete command
 * @generated from apis/overlays/web-assets.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"managed-labels": {
			kind: "parsed",
			brief: "List of managed label names.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"user-labels": {
			kind: "parsed",
			brief: "List of user label names.",
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
	command: "bulk-delete",
	describe: "Remove labels from web or API operations",
	usage:
		"$0 web-assets operations labels bulk-delete\n\nRemoves labels from multiple web or API operations in one request.",
	...parameters,
	loader: () => import("./bulk-delete.handler.js"),
});

export default command;
