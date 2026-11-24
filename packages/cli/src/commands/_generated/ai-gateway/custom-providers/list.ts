/**
 * list command
 * @generated from apis/overlays/ai-gateway.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		page: { kind: "parsed", brief: "Page", optional: true, parse: Number },
		"per-page": {
			kind: "parsed",
			brief: "Per page",
			optional: true,
			parse: Number,
		},
		beta: { kind: "boolean", brief: "Beta", optional: true },
		enable: { kind: "boolean", brief: "Enable", optional: true },
		search: {
			kind: "parsed",
			brief: "Search by id, name, slug",
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
	describe: "List custom providers",
	usage:
		"$0 ai-gateway custom-providers list\n\nLists the custom providers configured for the account, ordered by position and then name.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
