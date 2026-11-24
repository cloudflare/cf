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
		"category-id": { kind: "parsed", brief: "Category ID", parse: String },
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
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		body: {
			kind: "parsed",
			brief: "Attributes of the data tag to update.",
			optional: true,
			parse: String,
		},
	},
	operands: [{ placeholder: "tag-id", brief: "Tag ID", parse: String }],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "update <tag-id>",
	describe: "Update the attributes of a single data tag.",
	usage:
		"$0 zero-trust dlp data-tags update <tag-id>\n\nUpdates a data tag in a category.",
	...parameters,
	loader: () => import("./update.handler.js"),
});

export default command;
