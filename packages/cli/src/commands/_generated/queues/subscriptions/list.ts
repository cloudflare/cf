/**
 * list command
 * @generated from apis/overlays/queues.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"queue-id": {
			kind: "parsed",
			brief: "Filter event subscriptions by destination queue ID.",
			optional: true,
			parse: String,
		},
		page: {
			kind: "parsed",
			brief: "Page number for pagination",
			optional: true,
			parse: Number,
		},
		"per-page": {
			kind: "parsed",
			brief: "Number of items per page",
			optional: true,
			parse: Number,
		},
		order: {
			kind: "enum",
			brief: "Field to sort by",
			values: ["created_at", "name", "enabled", "source"],
			optional: true,
		},
		direction: {
			kind: "enum",
			brief: "Sort direction",
			values: ["asc", "desc"],
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
	describe: "List Event Subscriptions",
	usage:
		"$0 queues subscriptions list\n\nReturns a paginated list of Queue event subscriptions with optional sorting and filtering.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
