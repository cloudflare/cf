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
		name: {
			kind: "parsed",
			brief:
				"The name of the user population. Leading and trailing whitespace is trimmed before validation. After trimming, the name must contain at least one non-whitespace character and must not exceed 128 UTF-8 bytes.\n",
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
	describe: "Create a user population",
	usage:
		"$0 zero-trust access user-populations create\n\nCreates a user population in an account. Requires permission to update the account's Access organization.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;
