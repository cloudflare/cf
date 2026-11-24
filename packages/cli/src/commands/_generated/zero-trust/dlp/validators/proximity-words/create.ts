/**
 * create command
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
			brief: "Attributes of the new validator.",
			optional: true,
			parse: String,
		},
	},
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "create",
	describe: "Create a proximity word validator",
	usage:
		"$0 zero-trust dlp validators proximity-words create\n\nCreates a reusable list of weighted words that detection entries can attach to in order to refine their matches. An account may own at most 100 validators across all kinds.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;
