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
	describe: "Get Zero Trust Connectivity Settings",
	usage:
		"$0 zero-trust connectivity-settings get\n\nGets the Zero Trust Connectivity Settings for the given account.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
