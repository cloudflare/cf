/**
 * rotate command
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
	command: "rotate",
	describe: "Rotate Access keys",
	usage:
		"$0 zero-trust access signing-keys rotate\n\nPerfoms a key rotation for an account.",
	...parameters,
	loader: () => import("./rotate.handler.js"),
});

export default command;
