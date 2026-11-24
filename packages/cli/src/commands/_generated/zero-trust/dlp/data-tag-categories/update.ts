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
		tags: {
			kind: "parsed",
			brief:
				'The desired final state of tags.\n- `None` (omitted): no tag changes.\n- `Some([])`: delete all tags.\n- `Some([...])`: desired final set + order. Provide as a JSON array of objects, null, or @path/to/file.json. Shape: [({"description"?: (string | null), "name"?: (string | null)} & {"id"?: (string | null)})]. ? marks optional keys.',
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
			brief: "Attributes of the data tag category to update.",
			optional: true,
			parse: String,
		},
	},
	operands: [
		{ placeholder: "category-id", brief: "Category ID", parse: String },
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "update <category-id>",
	describe: "Update the attributes of a single data tag category.",
	usage:
		"$0 zero-trust dlp data-tag-categories update <category-id>\n\nUpdates a data tag category and its tags.",
	...parameters,
	loader: () => import("./update.handler.js"),
});

export default command;
