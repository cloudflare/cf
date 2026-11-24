/**
 * update command
 * @generated from apis/overlays/field-extractors.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		rules: {
			kind: "parsed",
			brief:
				'The rules field. Provide as a JSON array of objects or @path/to/file.json. Shape: [{"fields": [{...}], "ref": string, "description"?: string}]. ? marks optional keys.',
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
			brief: "Desired-state replacement of all rules for this extractor type.",
			optional: true,
			parse: String,
		},
	},
	operands: [
		{ placeholder: "extractor", brief: "Extractor type.", parse: String },
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "update <extractor>",
	describe: "Update Field Extractor",
	usage:
		"$0 field-extractors update <extractor>\n\nReplaces all custom extraction rules for an extractor type. Omitted rules are deleted.",
	...parameters,
	loader: () => import("./update.handler.js"),
});

export default command;
