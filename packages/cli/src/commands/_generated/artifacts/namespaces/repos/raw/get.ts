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
		name: { kind: "parsed", brief: "Repository name.", parse: String },
		ref: {
			kind: "parsed",
			brief: "Git ref, branch, tag, or 40-character commit hash.",
			parse: String,
		},
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
	operands: [
		{
			placeholder: "path",
			brief: "File path. May contain slashes.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <path>",
	describe: "Read a raw file with content type",
	usage:
		"$0 artifacts namespaces repos raw get <path>\n\nReturns file bytes resolved by ref and path, with a sniffed content type and browser-safe response headers.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
