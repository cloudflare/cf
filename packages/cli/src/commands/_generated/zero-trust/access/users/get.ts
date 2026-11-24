/**
 * get command
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
	},
	operands: [{ placeholder: "user-id", brief: "UUID.", parse: String }],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <user-id>",
	describe: "Get a user",
	usage:
		"$0 zero-trust access users get <user-id>\n\nGets a specific user for an account.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
