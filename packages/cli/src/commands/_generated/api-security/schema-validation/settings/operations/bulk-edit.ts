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
	describe: "Bulk edit per-operation schema validation settings",
	usage:
		"$0 api-security schema-validation settings operations bulk-edit\n\nUpdates schema validation settings for multiple API operations in a single request. Efficient for applying consistent validation rules across endpoints.",
	...parameters,
	loader: () => import("./bulk-edit.handler.js"),
});

export default command;
