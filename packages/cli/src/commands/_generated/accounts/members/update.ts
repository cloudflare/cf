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
		roles: {
			kind: "parsed",
			brief:
				'Roles assigned to this member. Provide as a JSON array of objects or @path/to/file.json. Shape: [{"id": string}].',
			optional: true,
			parse: String,
		},
		policies: {
			kind: "parsed",
			brief:
				'Array of policies associated with this member. Provide as a JSON array of objects or @path/to/file.json. Shape: [{"access": "allow" | "deny", "permission_groups": [{...}], "resource_groups": [{...}]}].',
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
			placeholder: "member-id",
			brief: "Membership identifier tag.",
			parse: String,
		},
	],
	rules(rules) {
		rules.conflicts("roles", ["policies"]);
		rules.conflicts("policies", ["roles"]);
	},
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "update <member-id>",
	describe: "Update Member",
	usage: "$0 accounts members update <member-id>\n\nModify an account member.",
	...parameters,
	loader: () => import("./update.handler.js"),
});

export default command;
