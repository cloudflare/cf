/**
 * create command
 * @generated from apis/overlays/accounts.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";
import { resolveFileToken } from "#lib/input-validation.js";

const parameters = {
	flags: {
		email: {
			kind: "parsed",
			brief: "The contact email address of the user.",
			optional: true,
			parse: String,
		},
		roles: {
			kind: "parsed",
			brief: "Array of roles associated with this member.",
			variadic: true,
			optional: true,
			parse: String,
		},
		status: {
			kind: "parsed",
			brief:
				"Status of the member invitation. If not provided during creation, defaults to 'pending'.\nChanging from 'accepted' back to 'pending' will trigger a replacement of the member resource in Terraform.",
			optional: true,
			choices: ["accepted", "pending"],
			parse: String,
			coerce: (value: string) => resolveFileToken(value, "status", "text"),
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
	operands: [],
	rules(rules) {
		rules.conflicts("roles", ["policies"]);
		rules.conflicts("policies", ["roles"]);
	},
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "create",
	describe: "Add Member",
	usage:
		"$0 accounts members create\n\nAdd a user to the list of members for this account.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;
