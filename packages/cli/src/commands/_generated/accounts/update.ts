/**
 * update command
 * @generated from apis/overlays/accounts.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		id: { kind: "parsed", brief: "Identifier", optional: true, parse: String },
		name: {
			kind: "parsed",
			brief:
				"Account name. When creating or updating an account, the name is limited to 65 UTF-8 bytes.",
			optional: true,
			parse: String,
		},
		"settings-abuse-contact-email": {
			kind: "parsed",
			brief: "Sets an abuse contact email to notify for abuse reports.",
			optional: true,
			parse: String,
		},
		"settings-enforce-twofactor": {
			kind: "boolean",
			brief:
				"Indicates whether membership in this account requires that\nTwo-Factor Authentication is enabled",
			optional: true,
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
	command: "update",
	describe: "Update Account",
	usage:
		"$0 accounts update\n\nUpdate an existing account. Account names are limited to 65 UTF-8 bytes.",
	...parameters,
	loader: () => import("./update.handler.js"),
});

export default command;
