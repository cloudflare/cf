/**
 * list command
 * @generated from apis/overlays/zero-trust.ts
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
			brief: "Page number of results.",
			optional: true,
			parse: Number,
		},
		"per-page": {
			kind: "parsed",
			brief: "Number of results per page.",
			optional: true,
			parse: Number,
		},
		status: {
			kind: "enum",
			brief:
				"JIT request status. `SPENT` is deprecated and interpreted as `APPROVED`.",
			values: ["PENDING", "APPROVED", "DENIED", "CANCELED", "SPENT"],
			optional: true,
		},
		search: {
			kind: "parsed",
			brief:
				"Case-insensitive search over request ID, requester email, application audience, and application hostname.",
			optional: true,
			parse: String,
		},
		since: {
			kind: "parsed",
			brief:
				"The earliest request timestamp to query. Defaults to 366 days before the current time.",
			optional: true,
			parse: String,
		},
		until: {
			kind: "parsed",
			brief:
				"The latest request timestamp to query. Defaults to the current time.",
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
	describe: "List Access JIT request logs",
	usage:
		"$0 zero-trust access logs jit-requests list\n\nLists account-wide Access JIT request logs reconstructed from request lifecycle events.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
