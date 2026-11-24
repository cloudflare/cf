/**
 * list command
 * @generated from apis/overlays/user.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		page: {
			kind: "parsed",
			brief: "Page number of paginated results.",
			optional: true,
			parse: Number,
		},
		"per-page": {
			kind: "parsed",
			brief: "Number of items per page.",
			optional: true,
			parse: Number,
		},
		order: {
			kind: "enum",
			brief: "Field to order billing history by.",
			values: ["type", "occurred_at", "action"],
			optional: true,
		},
		"occurred-at": {
			kind: "parsed",
			brief: "When the billing item was created.",
			optional: true,
			parse: String,
		},
		type: {
			kind: "parsed",
			brief: "The billing item type.",
			optional: true,
			parse: String,
		},
		action: {
			kind: "parsed",
			brief: "The billing item action.",
			optional: true,
			parse: String,
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
	describe: "Billing History Details",
	usage:
		"$0 user billing history list\n\nAccesses your billing history object.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
