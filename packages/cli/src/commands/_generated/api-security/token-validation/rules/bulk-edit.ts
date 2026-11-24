/**
 * bulk-edit command
 * @generated from apis/overlays/api-security.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
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
	command: "bulk-edit",
	describe: "Edit token validation rules",
	usage:
		"$0 api-security token-validation rules bulk-edit\n\nUpdates and reorders multiple token validation rules in one request, then returns the updated rules.",
	...parameters,
	loader: () => import("./bulk-edit.handler.js"),
});

export default command;
