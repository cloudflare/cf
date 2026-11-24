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
			values: [
				"id",
				"service",
				"title",
				"type",
				"status",
				"statusUpdated",
				"count",
				"firstObserved",
				"lastObserved",
				"created",
				"updated",
			],
			optional: true,
		},
		search: { kind: "parsed", brief: "Search", optional: true, parse: String },
		service: {
			kind: "parsed",
			brief: "Service",
			optional: true,
			parse: String,
		},
		type: { kind: "parsed", brief: "Type", optional: true, parse: String },
		status: {
			kind: "enum",
			brief: "Status",
			values: ["active", "resolved", "ignored"],
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
	describe: "List detected issues",
	usage: "$0 o11y issues list\n\nList detected issues.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
