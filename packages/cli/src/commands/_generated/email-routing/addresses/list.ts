/**
 * list command
 * @generated from apis/overlays/email-routing.ts
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
			brief: "Sorts results in an ascending or descending order.",
			values: ["asc", "desc"],
			optional: true,
		},
		verified: {
			kind: "enum",
			brief: "Filter by verified destination addresses.",
			values: ["true", "false"],
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
	describe: "List destination addresses",
	usage:
		"$0 email-routing addresses list\n\nLists destination addresses configured for Email Routing in an account.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
