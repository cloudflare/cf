/**
 * get command
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
		ref: {
			kind: "parsed",
			brief: "Git ref, branch, tag, or commit hash.",
			parse: String,
		},
		path: { kind: "parsed", brief: "File path.", parse: String },
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		text: {
			kind: "boolean",
			brief:
				"Decode the response body as UTF-8 text instead of writing raw bytes",
			default: false,
		},
	},
	operands: [{ placeholder: "name", brief: "Repository name.", parse: String }],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <name>",
	describe: "Read a file",
	usage:
		"$0 artifacts namespaces repos files get <name>\n\nReturns raw bytes for a file resolved by ref and path.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
