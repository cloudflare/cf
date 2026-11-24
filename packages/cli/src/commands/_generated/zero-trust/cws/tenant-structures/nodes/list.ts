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
		"structure-id": {
			kind: "parsed",
			brief: "ID of the parent tenant structure",
			parse: String,
		},
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
		"node-kind": {
			kind: "parsed",
			brief: "Filter by exact node kind",
			optional: true,
			parse: String,
		},
		"native-id": {
			kind: "parsed",
			brief: "Filter by exact cloud-native identifier",
			optional: true,
			parse: String,
		},
		name: {
			kind: "parsed",
			brief: "Filter by node name (case-insensitive substring match)",
			optional: true,
			parse: String,
		},
		parent: {
			kind: "parsed",
			brief: "Filter by exact parent native ID",
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
	describe: "List nodes for a tenant structure",
	usage:
		"$0 zero-trust cws tenant-structures nodes list\n\nReturns a paginated list of nodes in the tenant structure.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
