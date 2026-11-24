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
			brief: "Attributes of the new data tag.",
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
	command: "create <category-id>",
	describe: "Creates a new data tag.",
	usage:
		"$0 zero-trust dlp data-tags create <category-id>\n\nCreates a data tag in a category.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;
