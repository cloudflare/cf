/**
 * edit command
 * @generated from apis/overlays/workflows.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"default-retention-error-retention": {
			kind: "parsed",
			brief:
				"Specifies the duration in milliseconds or as a string like '5 minutes'. Accepts a JSON scalar or plain string, or @path/to/file.",
			optional: true,
			parse: String,
		},
		"default-retention-success-retention": {
			kind: "parsed",
			brief:
				"Specifies the duration in milliseconds or as a string like '5 minutes'. Accepts a JSON scalar or plain string, or @path/to/file.",
			optional: true,
			parse: String,
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
	command: "edit",
	describe: "Update account settings",
	usage:
		"$0 workflows settings edit\n\nUpdates only the account-level Workflows settings fields present in the request body.",
	...parameters,
	loader: () => import("./edit.handler.js"),
});

export default command;
