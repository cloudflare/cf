/**
 * list command
 * @generated from apis/overlays/rum.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"per-page": {
			kind: "parsed",
			brief: "Number of items to return per page of results.",
			optional: true,
			parse: Number,
		},
		page: {
			kind: "parsed",
			brief: "Current page within the paginated list of results.",
			optional: true,
			parse: Number,
		},
		"order-by": {
			kind: "enum",
			brief: "The property used to sort the list of results.",
			values: ["host", "created"],
			optional: true,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "list",
	describe: "List Web Analytics sites",
	usage:
		"$0 rum site-info list\n\nLists all Web Analytics sites of an account.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
