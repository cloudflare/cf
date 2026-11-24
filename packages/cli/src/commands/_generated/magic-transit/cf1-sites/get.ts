/**
 * get command
 * @generated from apis/overlays/magic-transit.ts
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
		{ placeholder: "cf1-site-id", brief: "Identifier", parse: String },
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <cf1-site-id>",
	describe: "Get CF1 Site",
	usage:
		"$0 magic-transit cf1-sites get <cf1-site-id>\n\nGets a specific CF1 Site for an account.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
