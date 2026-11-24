/**
 * create command
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
				'Policies attached to the User group. Provide as a JSON array of objects or @path/to/file.json. Shape: [{"access": "allow" | "deny", "permission_groups": [{...}], "resource_groups": [{...}]}].',
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
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "create",
	describe: "Create User Group",
	usage:
		"$0 iam user-groups create\n\nCreate a new user group under the specified account.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;
