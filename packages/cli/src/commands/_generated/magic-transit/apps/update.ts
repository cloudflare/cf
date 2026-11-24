/**
 * update command
 * @generated from apis/overlays/magic-transit.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		hostnames: {
			kind: "parsed",
			brief: "FQDNs to associate with traffic decisions.",
			variadic: true,
			optional: true,
			parse: String,
		},
		name: {
			kind: "parsed",
			brief: "Display name for the app.",
			optional: true,
			parse: String,
		},
		type: {
			kind: "parsed",
			brief: "Category of the app.",
			optional: true,
			parse: String,
		},
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
		{ placeholder: "account-app-id", brief: "Identifier", parse: String },
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "update <account-app-id>",
	describe: "Update an App",
	usage:
		"$0 magic-transit apps update <account-app-id>\n\nUpdates an Account App",
	...parameters,
	loader: () => import("./update.handler.js"),
});

export default command;
