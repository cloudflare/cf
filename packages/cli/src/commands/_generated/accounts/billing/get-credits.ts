/**
 * get-credits command
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
	command: "get-credits",
	describe: "Get Account Credits",
	usage:
		"$0 accounts billing get-credits\n\nGets the credit balance and eligibility for an account.",
	...parameters,
	loader: () => import("./get-credits.handler.js"),
});

export default command;
