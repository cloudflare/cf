/**
 * delete command
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
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		force: {
			kind: "boolean",
			brief: "Skip confirmation (useful in scripts and CI)",
			alias: "f",
			default: false,
		},
	},
	operands: [{ placeholder: "tag-id", brief: "Tag ID", parse: String }],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "delete <tag-id>",
	describe: "Delete a single data tag.",
	usage:
		"$0 zero-trust dlp data-tags delete <tag-id>\n\nDeletes a data tag from a category.",
	...parameters,
	loader: () => import("./delete.handler.js"),
});

export default command;
