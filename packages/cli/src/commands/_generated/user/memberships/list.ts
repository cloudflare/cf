/**
 * list command
 * @generated from apis/overlays/user.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"account-name": {
			kind: "parsed",
			brief: "Account name",
			optional: true,
			parse: String,
		},
		page: {
			kind: "parsed",
			brief: "Page number of paginated results.",
			optional: true,
			parse: Number,
		},
		"per-page": {
			kind: "parsed",
			brief: "Number of memberships per page.",
			optional: true,
			parse: Number,
		},
		order: {
			kind: "enum",
			brief: "Field to order memberships by.",
			values: ["id", "account.name", "status"],
			optional: true,
		},
		direction: {
			kind: "enum",
			brief: "Direction to order memberships.",
			values: ["asc", "desc"],
			optional: true,
		},
		name: {
			kind: "parsed",
			brief: "Account name",
			optional: true,
			parse: String,
		},
		status: {
			kind: "enum",
			brief: "Status of this membership.",
			values: ["accepted", "pending", "rejected"],
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
	describe: "List Memberships",
	usage:
		"$0 user memberships list\n\nList memberships of accounts the user can access.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
