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
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get",
	describe: "Get logging settings for the Zero Trust account",
	usage:
		"$0 zero-trust gateway logging get\n\nRetrieve the current logging settings for the Zero Trust account.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
