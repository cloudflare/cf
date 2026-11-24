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
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
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
	command: "get <list-id>",
	describe: "Get a list",
	usage: "$0 rules lists get <list-id>\n\nFetches the details of a list.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
