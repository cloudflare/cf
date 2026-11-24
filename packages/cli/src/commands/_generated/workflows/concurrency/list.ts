/**
 * list command
 * @generated from apis/overlays/workflows.ts
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
			brief: "Per page",
			optional: true,
			parse: Number,
		},
		page: { kind: "parsed", brief: "Page", optional: true, parse: Number },
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
	describe: "List concurrency keys",
	usage:
		"$0 workflows concurrency list\n\nLists the account-scoped concurrency keys.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
