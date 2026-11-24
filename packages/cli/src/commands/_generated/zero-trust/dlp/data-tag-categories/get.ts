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
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [
		{ placeholder: "category-id", brief: "Category ID", parse: String },
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <category-id>",
	describe: "Retrieve a specific data tag category.",
	usage:
		"$0 zero-trust dlp data-tag-categories get <category-id>\n\nGets a data tag category and its tags.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
