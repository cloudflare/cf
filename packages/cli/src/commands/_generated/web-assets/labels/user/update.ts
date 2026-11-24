/**
 * update command
 * @generated from apis/overlays/web-assets.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		description: {
			kind: "parsed",
			brief: "The description of the label",
			optional: true,
			parse: String,
		},
		metadata: {
			kind: "parsed",
			brief:
				'Metadata for the label. Provide as a JSON object or @path/to/file.json. Shape: {"<key>": unknown}.',
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
	operands: [{ placeholder: "name", brief: "The label name", parse: String }],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "update <name>",
	describe: "Update a user-defined operation label",
	usage:
		"$0 web-assets labels user update <name>\n\nReplaces all editable fields on a user-defined label.",
	...parameters,
	loader: () => import("./update.handler.js"),
});

export default command;
