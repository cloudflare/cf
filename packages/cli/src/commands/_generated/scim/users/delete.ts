/**
 * delete command
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
		force: {
			kind: "boolean",
			brief: "Skip confirmation (useful in scripts and CI)",
			alias: "f",
			default: false,
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
	command: "delete <user-id>",
	describe: "Delete SCIM User",
	usage:
		"$0 scim users delete <user-id>\n\nDeprovisions a SCIM User by removing their membership from this account (RFC 7644 Section 3.6). This does not delete the global Cloudflare user.",
	...parameters,
	loader: () => import("./delete.handler.js"),
});

export default command;
