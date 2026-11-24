/**
 * list command
 * @generated from apis/overlays/iam.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"user-group-id": {
			kind: "parsed",
			brief: "User Group identifier tag.",
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
			brief: "Maximum number of results per page.",
			optional: true,
			parse: Number,
		},
		"fuzzy-email": {
			kind: "parsed",
			brief: "A string used for filtering members by partial email match.",
			optional: true,
			parse: String,
		},
		direction: {
			kind: "enum",
			brief: "The sort order of returned user group members by email.",
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
	describe: "List User Group Members",
	usage:
		"$0 iam user-groups members list\n\nList all the members attached to a user group.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
