/**
 * update command
 * @generated from apis/overlays/content-scan.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		payload: {
			kind: "parsed",
			brief:
				"Defines the custom content extraction expression used to reach content objects in the request.",
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
			brief: "Content Scanning custom expression to update.",
			optional: true,
			parse: String,
		},
	},
	operands: [
		{
			placeholder: "expression-id",
			brief:
				"Defines the unique ID for this Content Scanning custom expression.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "update <expression-id>",
	describe: "Update a Content Scanning custom expression for a zone.",
	usage:
		"$0 content-scan expressions update <expression-id>\n\nUpdate the Content Scanning custom expression with the given identifier and return the updated list of expressions.",
	...parameters,
	loader: () => import("./update.handler.js"),
});

export default command;
