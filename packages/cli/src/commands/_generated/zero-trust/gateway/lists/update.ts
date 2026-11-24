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
			brief: "Provide the list description.",
			optional: true,
			parse: String,
		},
		items: {
			kind: "parsed",
			brief:
				'Add items to the list. Provide as a JSON array of objects or @path/to/file.json. Shape: [{"description"?: string, "value"?: string}]. ? marks optional keys.',
			optional: true,
			parse: String,
		},
		name: {
			kind: "parsed",
			brief: "Specify the list name.",
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
			brief: "Identify the API resource with a UUID.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "update <list-id>",
	describe: "Update Zero Trust list",
	usage:
		"$0 zero-trust gateway lists update <list-id>\n\nUpdates a configured Zero Trust list. Skips updating list items if not included in the payload. A non empty list items will overwrite the existing list.",
	...parameters,
	loader: () => import("./update.handler.js"),
});

export default command;
