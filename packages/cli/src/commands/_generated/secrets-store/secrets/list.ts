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
		"store-id": { kind: "parsed", brief: "Store identifier.", parse: String },
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
		search: {
			kind: "parsed",
			brief:
				"Search secrets using a filter string, filtering across name and comment.",
			optional: true,
			parse: String,
		},
		order: {
			kind: "enum",
			brief: "Order secrets by values in the given field.",
			values: ["name", "comment", "created", "modified", "status"],
			optional: true,
		},
		scopes: {
			kind: "parsed",
			brief: "Only secrets with the given scopes will be returned.",
			variadic: true,
			optional: true,
			choices: [
				"workers",
				"ai_gateway",
				"dex",
				"access",
				"containers",
				"websearch",
			],
			parse: String,
			coerce: (values: string[]) => values.flatMap((value) => value.split(",")),
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
	describe: "List store secrets",
	usage: "$0 secrets-store secrets list\n\nLists all store secrets.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
