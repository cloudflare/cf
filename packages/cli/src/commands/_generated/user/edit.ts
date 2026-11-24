/**
 * edit command
 * @generated from apis/overlays/user.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		country: {
			kind: "parsed",
			brief: "The country in which the user lives.",
			optional: true,
			parse: String,
		},
		"first-name": {
			kind: "parsed",
			brief: "User's first name",
			optional: true,
			parse: String,
		},
		"last-name": {
			kind: "parsed",
			brief: "User's last name",
			optional: true,
			parse: String,
		},
		telephone: {
			kind: "parsed",
			brief: "User's telephone number",
			optional: true,
			parse: String,
		},
		zipcode: {
			kind: "parsed",
			brief: "The zipcode or postal code where the user lives.",
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
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "edit",
	describe: "Edit User",
	usage: "$0 user edit\n\nEdit part of your user details.",
	...parameters,
	loader: () => import("./edit.handler.js"),
});

export default command;
