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
		id: {
			kind: "parsed",
			brief: "ID of the permission group to be fetched.",
			optional: true,
			parse: String,
		},
		name: {
			kind: "parsed",
			brief: "Name of the permission group to be fetched.",
			optional: true,
			parse: String,
		},
		label: {
			kind: "parsed",
			brief: "Label of the permission group to be fetched.",
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
			brief: "Maximum number of results per page.",
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
	describe: "List Account Permission Groups",
	usage:
		"$0 iam permission-groups list\n\nList all the permissions groups for an account.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
