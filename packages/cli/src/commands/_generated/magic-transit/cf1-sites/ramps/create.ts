/**
 * create command
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
		body: {
			kind: "parsed",
			brief: "Raw JSON request body (bypasses individual flags)",
			optional: true,
			parse: String,
		},
	},
	operands: [
		{ placeholder: "cf1-site-id", brief: "Identifier", parse: String },
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "create <cf1-site-id>",
	describe: "Create CF1 Site Ramps",
	usage:
		"$0 magic-transit cf1-sites ramps create <cf1-site-id>\n\nCreates ramps (network connections) for a CF1 Site.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;
