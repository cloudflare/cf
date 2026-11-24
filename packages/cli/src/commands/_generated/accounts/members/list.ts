/**
 * list command
 * @generated from apis/overlays/accounts.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		order: {
			kind: "enum",
			brief: "Field to order results by.",
			values: ["user.first_name", "user.last_name", "user.email", "status"],
			optional: true,
		},
		status: {
			kind: "enum",
			brief: "A member's status in the account.",
			values: ["accepted", "pending", "rejected"],
			optional: true,
		},
		page: {
			kind: "parsed",
			brief: "Page number of paginated results.",
			optional: true,
			parse: Number,
		},
		"per-page": {
			kind: "parsed",
			brief: "Maximum number of results per page.",
			optional: true,
			parse: Number,
		},
		direction: {
			kind: "enum",
			brief: "Direction to order results.",
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
	describe: "List Members",
	usage: "$0 accounts members list\n\nList all members of an account.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
