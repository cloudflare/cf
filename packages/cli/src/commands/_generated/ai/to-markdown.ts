/**
 * to-markdown command
 * @generated from apis/overlays/ai.ts
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
		files: {
			kind: "parsed",
			brief:
				"Literal content or @path/to/file for the `files` form field. Repeat for multiple files. Files to convert, supplied as multipart file uploads.",
			variadic: true,
			optional: true,
			requiresArg: true,
			parse: String,
		},
	},
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "to-markdown",
	describe: "Convert uploaded files to Markdown",
	usage:
		"$0 ai to-markdown\n\nConverts files uploaded as multipart form data into Markdown using Workers AI. Returns a conversion result for each file. Use the supported-formats endpoint to check accepted file types.",
	...parameters,
	loader: () => import("./to-markdown.handler.js"),
});

export default command;
