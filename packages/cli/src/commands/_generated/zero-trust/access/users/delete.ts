/**
 * delete command
 * @generated from apis/overlays/zero-trust.ts
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
		force: {
			kind: "boolean",
			brief: "Skip confirmation (useful in scripts and CI)",
			alias: "f",
			default: false,
		},
	},
	operands: [{ placeholder: "user-id", brief: "UUID.", parse: String }],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "delete <user-id>",
	describe: "Delete a user",
	usage:
		"$0 zero-trust access users delete <user-id>\n\nDeletes a specific user for an account. This will also revoke any active seats and tokens for the user.",
	...parameters,
	loader: () => import("./delete.handler.js"),
});

export default command;
