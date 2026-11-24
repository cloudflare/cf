/**
 * get command
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
	},
	operands: [{ placeholder: "tag-id", brief: "Tag ID", parse: String }],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <tag-id>",
	describe: "Retrieve a specific data tag.",
	usage:
		"$0 zero-trust dlp data-tags get <tag-id>\n\nGets a data tag from a category.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
