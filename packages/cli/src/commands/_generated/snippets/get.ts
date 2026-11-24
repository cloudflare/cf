/**
 * get command
 * @generated from apis/overlays/snippets.ts
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
			placeholder: "snippet-name",
			brief: "Identify the snippet.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <snippet-name>",
	describe: "Get a zone snippet",
	usage:
		"$0 snippets get <snippet-name>\n\nFetches a snippet belonging to the zone.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
