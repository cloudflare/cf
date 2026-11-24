/**
 * verify command
 * @generated from apis/overlays/accounts.ts
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
	command: "verify",
	describe: "Verify Token",
	usage: "$0 accounts tokens verify\n\nTest whether a token works.",
	...parameters,
	loader: () => import("./verify.handler.js"),
});

export default command;
