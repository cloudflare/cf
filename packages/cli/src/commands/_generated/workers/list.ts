/**
 * list command
 * @generated from apis/overlays/workers.ts
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
		"order-by": {
			kind: "enum",
			brief: "Property to sort results by.",
			values: ["deployed_on", "updated_on", "created_on", "name"],
			optional: true,
		},
		order: {
			kind: "enum",
			brief: "Sort direction.",
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
	describe: "List Workers",
	usage: "$0 workers list\n\nList all Workers for an account.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
