/**
 * update command
 * @generated from apis/overlays/zero-trust.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		email: {
			kind: "parsed",
			brief: "The email of the user.",
			optional: true,
			parse: String,
		},
		name: {
			kind: "parsed",
			brief: "The name of the user.",
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
	operands: [{ placeholder: "user-id", brief: "UUID.", parse: String }],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "update <user-id>",
	describe: "Update a user",
	usage:
		"$0 zero-trust access users update <user-id>\n\nUpdates a specific user's name for an account. Requires the user's current email as confirmation (email cannot be changed).",
	...parameters,
	loader: () => import("./update.handler.js"),
});

export default command;
