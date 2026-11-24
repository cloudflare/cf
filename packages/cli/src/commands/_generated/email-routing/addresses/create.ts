/**
 * create command
 * @generated from apis/overlays/email-routing.ts
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
			brief: "The contact email address of the user.",
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
	command: "create",
	describe: "Create a destination address",
	usage:
		"$0 email-routing addresses create\n\nCreate a destination address to forward your emails to. Destination addresses need to be verified before they can be used.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;
