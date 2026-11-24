/**
 * list command
 * @generated from apis/overlays/email-security.ts
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
			brief: "Current page within paginated list of results.",
			optional: true,
			parse: Number,
		},
		"per-page": {
			kind: "parsed",
			brief: "The number of results per page. Maximum value is 1000.",
			optional: true,
			parse: Number,
		},
		search: {
			kind: "parsed",
			brief: "Search term for filtering records. Behavior may change.",
			optional: true,
			parse: String,
		},
		order: {
			kind: "enum",
			brief: "Field to sort by.",
			values: ["name", "created_at"],
			optional: true,
		},
		direction: {
			kind: "enum",
			brief: "The sorting direction.",
			values: ["asc", "desc"],
			optional: true,
		},
		enabled: {
			kind: "boolean",
			brief: "Filter by enabled status.",
			optional: true,
		},
		name: {
			kind: "parsed",
			brief: "Filter by exact policy name.",
			optional: true,
			parse: String,
		},
		expired: {
			kind: "boolean",
			brief:
				"Filter to return only expired policies (`true`) or only policies that still apply (`false`). Omit to return both.",
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
	describe: "List content policies",
	usage:
		"$0 email-security content-policies list\n\nReturns a paginated list of content policies. These policies match against the subject or body of emails using a pattern. Supports filtering by name or enabled status, and searching across name and pattern fields.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
