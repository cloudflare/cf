/**
 * roll command
 * @generated from apis/overlays/user.ts
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
		force: {
			kind: "boolean",
			brief: "Skip confirmation (useful in scripts and CI)",
			alias: "f",
			default: false,
		},
	},
	operands: [
		{ placeholder: "token-id", brief: "Token identifier tag.", parse: String },
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "roll <token-id>",
	describe: "Roll Token",
	usage: "$0 user tokens roll <token-id>\n\nRoll the token secret.",
	...parameters,
	loader: () => import("./roll.handler.js"),
});

export default command;
