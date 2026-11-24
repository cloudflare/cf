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
			placeholder: "group-id",
			brief:
				"The group identifier for a SCIM Group resource. For system groups this is prefixed \`cloudflare-v1-<permissionGroupTag>\`; for custom user groups this is a UUID-style tag.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "update <group-id>",
	describe: "Replace SCIM Group",
	usage:
		"$0 scim groups update <group-id>\n\nReplaces the mutable attributes of a SCIM Group (RFC 7644 Section 3.5.1), including its complete member set. Omitting `externalId` clears it, and omitting `members` replaces the member set with an empty list. For system groups (prefixed `cloudflare-v1-`), only the member set is replaced.",
	...parameters,
	loader: () => import("./update.handler.js"),
});

export default command;
