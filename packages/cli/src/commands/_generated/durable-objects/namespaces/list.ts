/**
 * list command
 * @generated from apis/overlays/durable-objects.ts
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
			brief: "Current page.",
			optional: true,
			parse: Number,
		},
		"per-page": {
			kind: "parsed",
			brief: "Items per-page.",
			optional: true,
			parse: Number,
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
	describe: "List Durable Object Namespaces",
	usage:
		"$0 durable-objects namespaces list\n\nReturns the Durable Object namespaces owned by an account.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
