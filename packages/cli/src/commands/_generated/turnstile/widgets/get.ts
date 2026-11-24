/**
 * get command
 * @generated from apis/overlays/turnstile.ts
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
	operands: [
		{
			placeholder: "sitekey",
			brief: "Unique identifier for a Turnstile widget.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <sitekey>",
	describe: "Turnstile Widget Details",
	usage:
		"$0 turnstile widgets get <sitekey>\n\nReturns the configuration of a Turnstile widget.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
