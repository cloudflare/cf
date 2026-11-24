/**
 * get command
 * @generated from apis/overlays/o11y.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		view: {
			kind: "enum",
			brief:
				"Select the view of the query result to return, defaults to events.",
			values: ["events", "invocations", "calculations"],
			optional: true,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [
		{
			placeholder: "id",
			brief: "Specify the ID of the shared query.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <id>",
	describe: "View a query that has been shared",
	usage:
		"$0 o11y shared-queries get <id>\n\nShared queries store the results of a previously run query, allowing you to share the results with others.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
