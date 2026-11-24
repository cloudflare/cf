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
		{ placeholder: "template-id", brief: "Template ID", parse: String },
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <template-id>",
	describe: "Retrieve a specific data tag category template.",
	usage:
		"$0 zero-trust dlp data-tag-category-templates get <template-id>\n\nGets an available data tag category template.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
