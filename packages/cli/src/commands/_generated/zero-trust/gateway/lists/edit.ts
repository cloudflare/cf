/**
 * edit command
 * @generated from apis/overlays/zero-trust.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		append: {
			kind: "parsed",
			brief:
				'Add items to the list. Provide as a JSON array of objects or @path/to/file.json. Shape: [{"description"?: string, "value"?: string}]. ? marks optional keys.',
			optional: true,
			parse: String,
		},
		remove: {
			kind: "parsed",
			brief: "Lists of item values you want to remove.",
			variadic: true,
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
	command: "edit <list-id>",
	describe: "Patch Zero Trust list.",
	usage:
		"$0 zero-trust gateway lists edit <list-id>\n\nAppends or removes an item from a configured Zero Trust list.",
	...parameters,
	loader: () => import("./edit.handler.js"),
});

export default command;
