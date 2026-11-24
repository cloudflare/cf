/**
 * list command
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
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "list",
	describe: "List authenticator device AAGUIDs",
	usage:
		"$0 zero-trust access mfa authenticator-catalog list\n\nReturns a list of Authenticator Device AAGUIDs for MFA configuration.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
