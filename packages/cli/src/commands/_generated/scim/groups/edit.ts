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
			placeholder: "group-id",
			brief:
				"The group identifier for a SCIM Group resource. For system groups this is prefixed \`cloudflare-v1-<permissionGroupTag>\`; for custom user groups this is a UUID-style tag.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "edit <group-id>",
	describe: "Patch SCIM Group",
	usage:
		"$0 scim groups edit <group-id>\n\nPartially updates a SCIM Group via PATCH operations (RFC 7644 Section 3.5.2). Supports add, remove, and replace operations on `members`, `displayName`, and `externalId`. For system groups (prefixed `cloudflare-v1-`), only member management operations are supported.",
	...parameters,
	loader: () => import("./edit.handler.js"),
});

export default command;
