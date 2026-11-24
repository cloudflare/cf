/**
 * update command
 * @generated from apis/overlays/zero-trust.ts
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
			brief: "A name for this validator, at most 50 characters.",
			optional: true,
			parse: String,
		},
		words: {
			kind: "parsed",
			brief:
				'The words that raise confidence when found near a match, at most 100 per validator. Matching\nignores case, so the list may not contain the same word twice with different capitalisation.\nWords are stored as sent.\n\nFor example, a validator for medical record numbers might use\n`[{"word": "patient", "weight": "strong"}, {"word": "diagnosis", "weight": "moderate"},\n{"word": "mrn", "weight": "weak"}]`. Provide as a JSON array of objects or @path/to/file.json. Shape: [{"weight": "strong" | "moderate" | "weak", "word": string}].',
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
			brief: "Attributes of the validator to update.",
			optional: true,
			parse: String,
		},
	},
	operands: [
		{ placeholder: "validator-id", brief: "Validator ID", parse: String },
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "update <validator-id>",
	describe: "Update a proximity word validator",
	usage:
		"$0 zero-trust dlp validators proximity-words update <validator-id>\n\nReplaces the name and word list of a `proximity_words` validator. Attachments to detection entries are owned from the entry side and are not affected.",
	...parameters,
	loader: () => import("./update.handler.js"),
});

export default command;
