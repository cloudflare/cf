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
		username: {
			kind: "parsed",
			brief:
				"Login presented by the client. Printable ASCII only, excluding space and colon.",
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
	describe: "Create a basic-auth credential",
	usage:
		"$0 zero-trust cws basic-auth-credentials create\n\nCreates a basic-auth credential with the specified username.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;
