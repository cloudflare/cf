/**
 * update command
 * @generated from apis/overlays/rules.ts
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
			brief: "An informative summary of the list.",
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
			brief: "Raw JSON request body (bypasses individual flags)",
			optional: true,
			parse: String,
		},
	},
	operands: [
		{
			placeholder: "list-id",
			brief: "The unique ID of the list.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "update <list-id>",
	describe: "Update a list",
	usage:
		"$0 rules lists update <list-id>\n\nUpdates the description of a list.",
	...parameters,
	loader: () => import("./update.handler.js"),
});

export default command;
