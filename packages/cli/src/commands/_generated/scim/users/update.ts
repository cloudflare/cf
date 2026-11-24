/**
 * update command
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
	command: "update <user-id>",
	describe: "Replace SCIM User",
	usage:
		"$0 scim users update <user-id>\n\nReplaces a SCIM User resource (RFC 7644 Section 3.5.1). Fully replaces the mutable attributes of the user. Supports updating `userName`, `name`, `emails`, and `active`.",
	...parameters,
	loader: () => import("./update.handler.js"),
});

export default command;
