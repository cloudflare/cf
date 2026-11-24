/**
 * edit command
 * @generated from apis/overlays/email-security.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		comments: {
			kind: "parsed",
			brief: "Optional note describing the reason for the ignore pattern.",
			optional: true,
			parse: String,
		},
		pattern: {
			kind: "parsed",
			brief: "Regular expression identifying URLs to exempt from rewriting.",
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
			brief:
				"Updates a URL rewrite ignore pattern; modifies only the provided fields.",
			optional: true,
			parse: String,
		},
	},
	operands: [
		{
			placeholder: "pattern-id",
			brief: "URL ignore pattern identifier.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "edit <pattern-id>",
	describe: "Update a URL ignore pattern",
	usage:
		"$0 email-security url-ignore-patterns edit <pattern-id>\n\nUpdates an existing URL rewrite ignore pattern. Only provided fields will be modified.",
	...parameters,
	loader: () => import("./edit.handler.js"),
});

export default command;
