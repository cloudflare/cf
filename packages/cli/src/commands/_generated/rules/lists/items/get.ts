/**
 * get command
 * @generated from apis/overlays/rules.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"list-id": {
			kind: "parsed",
			brief: "The unique ID of the list.",
			parse: String,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [
		{
			placeholder: "item-id",
			brief: "Defines the unique ID of the item in the List.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <item-id>",
	describe: "Get a list item",
	usage:
		"$0 rules lists items get <item-id>\n\nFetches a list item in the list.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
