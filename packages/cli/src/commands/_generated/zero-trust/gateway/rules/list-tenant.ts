/**
 * list-tenant command
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
	command: "list-tenant",
	describe: "List Zero Trust Gateway rules inherited from the parent account",
	usage:
		"$0 zero-trust gateway rules list-tenant\n\nList Zero Trust Gateway rules for the parent account of an account in the MSP configuration.",
	...parameters,
	loader: () => import("./list-tenant.handler.js"),
});

export default command;
