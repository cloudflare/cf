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
			values: ["username", "created_at", "updated_at"],
			optional: true,
		},
		direction: {
			kind: "enum",
			brief: "Sort direction (default: asc)",
			values: ["asc", "desc"],
			optional: true,
		},
		username: {
			kind: "parsed",
			brief: "Filter by username (case-insensitive substring match)",
			optional: true,
			parse: String,
		},
		"deployment-id": {
			kind: "parsed",
			brief: "Filter to credentials attached to this deployment",
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
	describe: "List basic-auth credentials for an account",
	usage:
		"$0 zero-trust cws basic-auth-credentials list\n\nReturns a paginated list of basic-auth credentials in the account.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
