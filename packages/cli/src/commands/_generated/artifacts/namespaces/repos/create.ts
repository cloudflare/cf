/**
 * create command
 * @generated from apis/overlays/artifacts.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"default-branch": {
			kind: "parsed",
			brief:
				"Git branch name. Must match /^[a-zA-Z0-9][a-zA-Z0-9._/-]*$/, must not contain '..', and must not end with '/' or '.'.",
			optional: true,
			parse: String,
		},
		description: {
			kind: "parsed",
			brief: "The description field",
			optional: true,
			parse: String,
		},
		name: {
			kind: "parsed",
			brief: "The name field",
			optional: true,
			parse: String,
		},
		"read-only": {
			kind: "boolean",
			brief: "The read_only field",
			optional: true,
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
			placeholder: "namespace",
			brief: "Artifacts namespace name.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "create <namespace>",
	describe: "Create a repository",
	usage:
		"$0 artifacts namespaces repos create <namespace>\n\nCreates a Git-compatible Artifacts repository in a namespace.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;
