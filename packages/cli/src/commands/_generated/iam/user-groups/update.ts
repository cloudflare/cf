/**
 * update command
 * @generated from apis/overlays/iam.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		name: {
			kind: "parsed",
			brief: "Name of the User group.",
			optional: true,
			parse: String,
		},
		policies: {
			kind: "parsed",
			brief:
				'Policies attached to the User group. Provide as a JSON array of objects or @path/to/file.json. Shape: [({"id": string} & {"access": "allow" | "deny", "permission_groups": [{...}], "resource_groups": [{...}]})].',
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
			placeholder: "user-group-id",
			brief: "User Group identifier tag.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "update <user-group-id>",
	describe: "Update User Group",
	usage:
		"$0 iam user-groups update <user-group-id>\n\nModify an existing user group.",
	...parameters,
	loader: () => import("./update.handler.js"),
});

export default command;
