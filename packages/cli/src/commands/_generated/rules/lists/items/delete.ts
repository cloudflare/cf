/**
 * delete command
 * @generated from apis/overlays/rules.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		items: {
			kind: "parsed",
			brief:
				'The list items to delete, identified by their unique IDs. Provide as a JSON array of objects or @path/to/file.json. Shape: [{"id": string}].',
			optional: true,
			parse: String,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		force: {
			kind: "boolean",
			brief: "Skip confirmation (useful in scripts and CI)",
			alias: "f",
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
	command: "delete <list-id>",
	describe: "Delete list items",
	usage:
		"$0 rules lists items delete <list-id>\n\nRemoves one or more items from a list. This operation is asynchronous. To get the current operation status, invoke the `Get bulk operation status` endpoint with the returned `operation_id`. There is a limit of 1 pending bulk operation per account. If an outstanding bulk operation is in progress, the request will be rejected.",
	...parameters,
	loader: () => import("./delete.handler.js"),
});

export default command;
