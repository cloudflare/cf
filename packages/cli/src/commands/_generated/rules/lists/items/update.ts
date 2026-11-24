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
	describe: "Update all list items",
	usage:
		"$0 rules lists items update <list-id>\n\nRemoves all existing items from the list and adds the provided items to the list. This operation is asynchronous. To get the current operation status, invoke the `Get bulk operation status` endpoint with the returned `operation_id`. There is a limit of 1 pending bulk operation per account. If an outstanding bulk operation is in progress, the request will be rejected.",
	...parameters,
	loader: () => import("./update.handler.js"),
});

export default command;
