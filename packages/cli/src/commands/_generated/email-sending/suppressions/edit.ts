/**
 * edit command
 * @generated from apis/overlays/email-sending.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"expires-at": {
			kind: "parsed",
			brief:
				"New expiry. Send `null` to make the suppression permanent; omit to leave it unchanged.",
			optional: true,
			parse: String,
		},
		note: {
			kind: "parsed",
			brief:
				"Replacement advisory note. Send an empty string to clear it; omit to leave it unchanged.",
			optional: true,
			parse: String,
		},
		scope: {
			kind: "parsed",
			brief:
				'Not editable. Scope is fixed when the suppression is created; any value returns 400 with code `scope_immutable`. Delete and recreate the suppression to change it. Provide as a JSON object or @path/to/file.json. Shape: {"<key>": unknown}.',
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
		{
			placeholder: "suppression-id",
			brief: "The suppression's identifier.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "edit <suppression-id>",
	describe: "Update account Email Sending suppression",
	usage:
		"$0 email-sending suppressions edit <suppression-id>\n\nUpdates expiry or advisory note fields. Scope cannot be changed.",
	...parameters,
	loader: () => import("./edit.handler.js"),
});

export default command;
