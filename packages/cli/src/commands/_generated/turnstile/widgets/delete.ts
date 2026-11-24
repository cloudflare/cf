/**
 * delete command
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
		force: {
			kind: "boolean",
			brief: "Skip confirmation (useful in scripts and CI)",
			alias: "f",
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
	command: "delete <sitekey>",
	describe: "Delete a Turnstile Widget",
	usage:
		"$0 turnstile widgets delete <sitekey>\n\nDeletes a Turnstile widget from an account.",
	...parameters,
	loader: () => import("./delete.handler.js"),
});

export default command;
