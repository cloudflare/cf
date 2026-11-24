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
		name: {
			kind: "parsed",
			brief: "The name of the user.",
			optional: true,
			parse: String,
		},
		email: {
			kind: "parsed",
			brief: "The email of the user.",
			optional: true,
			parse: String,
		},
		search: {
			kind: "parsed",
			brief: "Search for users by other listed query parameters.",
			optional: true,
			parse: String,
		},
		page: {
			kind: "parsed",
			brief: "Page number of results.",
			optional: true,
			parse: Number,
		},
		"per-page": {
			kind: "parsed",
			brief: "Number of results per page.",
			optional: true,
			parse: Number,
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
	describe: "Get users",
	usage:
		"$0 zero-trust access users list\n\nGets a list of users for an account.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
