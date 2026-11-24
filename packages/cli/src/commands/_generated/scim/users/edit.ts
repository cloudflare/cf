/**
 * edit command
 * @generated from apis/overlays/scim.ts
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
		file: {
			kind: "parsed",
			brief: "Path to a file to upload as the request body",
			optional: true,
			parse: String,
		},
	},
	operands: [
		{
			placeholder: "user-id",
			brief: "The user tag identifying a SCIM User resource (account member).",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "edit <user-id>",
	describe: "Patch SCIM User",
	usage:
		'$0 scim users edit <user-id>\n\nPartially updates a SCIM User via PATCH operations (RFC 7644 Section 3.5.2). Supports updating `userName`, `name.givenName`, `name.familyName`, and `active`. Setting `active: false` deprovisions the user (removes them from the account). For IdP compatibility, `emails[type eq "work"].value` is also accepted as an alias for `userName`.',
	...parameters,
	loader: () => import("./edit.handler.js"),
});

export default command;
