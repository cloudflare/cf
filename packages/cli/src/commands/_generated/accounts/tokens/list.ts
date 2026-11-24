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
		"include-expired": {
			kind: "boolean",
			brief: "When true, includes recently-expired tokens in the response.",
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
	describe: "List Tokens",
	usage:
		"$0 accounts tokens list\n\nList Account Owned API tokens created for this account. Callers with `com.cloudflare.api.account.token.list_self` permission only receive tokens they created. Results include active, disabled, and recently-expired tokens when `include_expired` is set to true.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
