/**
 * delete command
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
		force: {
			kind: "boolean",
			brief: "Skip confirmation (useful in scripts and CI)",
			alias: "f",
			default: false,
		},
	},
	operands: [
		{ placeholder: "cf1-site-id", brief: "Identifier", parse: String },
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "delete <cf1-site-id>",
	describe: "Delete CF1 Site",
	usage:
		"$0 magic-transit cf1-sites delete <cf1-site-id>\n\nDeletes a specific CF1 Site for an account.",
	...parameters,
	loader: () => import("./delete.handler.js"),
});

export default command;
