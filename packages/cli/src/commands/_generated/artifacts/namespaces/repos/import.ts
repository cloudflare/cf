/**
 * import command
 * @generated from apis/overlays/artifacts.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		namespace: {
			kind: "parsed",
			brief: "Artifacts namespace name.",
			parse: String,
		},
		branch: {
			kind: "parsed",
			brief:
				"Git branch name. Must match /^[a-zA-Z0-9][a-zA-Z0-9._/-]*$/, must not contain '..', and must not end with '/' or '.'.",
			optional: true,
			parse: String,
		},
		depth: {
			kind: "parsed",
			brief: "The depth field",
			optional: true,
			parse: Number,
		},
		"read-only": {
			kind: "boolean",
			brief: "The read_only field",
			optional: true,
		},
		url: {
			kind: "parsed",
			brief: "The url field",
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
	operands: [{ placeholder: "name", brief: "Repository name.", parse: String }],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "import <name>",
	describe: "Import a repository",
	usage:
		"$0 artifacts namespaces repos import <name>\n\nImports an HTTPS Git repository into an Artifacts repository.",
	...parameters,
	loader: () => import("./import.handler.js"),
});

export default command;
