/**
 * get command
 * @generated from apis/overlays/email-routing.ts
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
	describe: "Get Email Routing settings",
	usage:
		"$0 email-routing settings get\n\nGet information about the settings for your Email Routing zone.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
