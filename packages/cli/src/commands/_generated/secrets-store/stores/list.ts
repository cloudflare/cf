/**
 * list command
 * @generated from apis/overlays/secrets-store.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		direction: {
			kind: "enum",
			brief: "Direction to sort objects.",
			values: ["asc", "desc"],
			optional: true,
		},
		page: {
			kind: "parsed",
			brief: "Page number.",
			optional: true,
			parse: Number,
		},
		"per-page": {
			kind: "parsed",
			brief: "Number of objects to return per page.",
			optional: true,
			parse: Number,
		},
		order: {
			kind: "enum",
			brief: "Order stores by values in the given field.",
			values: ["name", "created", "modified"],
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
	describe: "List account stores",
	usage:
		"$0 secrets-store stores list\n\nLists account stores from an eventually consistent projection. Returns retryable HTTP 503 until initial backfill completes; empty accounts are ready immediately.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
