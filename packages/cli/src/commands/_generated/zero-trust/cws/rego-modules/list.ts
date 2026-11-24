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
		cursor: {
			kind: "parsed",
			brief: "Pagination cursor from previous response",
			optional: true,
			parse: String,
		},
		"per-page": {
			kind: "parsed",
			brief: "Number of items per page (1-100, default 20)",
			optional: true,
			parse: Number,
		},
		order: {
			kind: "enum",
			brief: "Field to order results by (default: created_at)",
			values: ["name", "created_at", "updated_at"],
			optional: true,
		},
		direction: {
			kind: "enum",
			brief: "Sort direction (default: asc)",
			values: ["asc", "desc"],
			optional: true,
		},
		name: {
			kind: "parsed",
			brief: "Filter by Rego module name (case-insensitive substring match)",
			optional: true,
			parse: String,
		},
		"package-path": {
			kind: "parsed",
			brief: "Filter by package path (case-sensitive literal substring match)",
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
	describe: "List Rego modules",
	usage:
		"$0 zero-trust cws rego-modules list\n\nReturns a paginated list of library Rego modules in the account.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
