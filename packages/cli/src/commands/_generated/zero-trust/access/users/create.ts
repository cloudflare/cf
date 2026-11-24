/**
 * create command
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
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "create",
	describe: "Create a user",
	usage: "$0 zero-trust access users create\n\nCreates a new user.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;
