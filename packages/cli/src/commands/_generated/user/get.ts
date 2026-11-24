/**
 * get command
 * @generated from apis/overlays/user.ts
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
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get",
	describe: "User Details",
	usage:
		"$0 user get\n\nRetrieves detailed information about the currently authenticated user, including email, name, and account memberships.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
