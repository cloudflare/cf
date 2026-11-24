/**
 * list command
 * @generated from apis/overlays/o11y.ts
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
			brief: "PerPage",
			optional: true,
			parse: Number,
		},
		order: {
			kind: "enum",
			brief: "Order",
			values: ["asc", "desc"],
			optional: true,
		},
		"order-by": {
			kind: "enum",
			brief: "OrderBy",
			values: ["created", "updated"],
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
	describe: "List queries",
	usage: "$0 o11y queries list\n\nList saved queries.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
