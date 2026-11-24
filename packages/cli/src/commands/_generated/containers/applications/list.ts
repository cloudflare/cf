/**
 * list command
 * @generated from apis/overlays/containers.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"per-page": {
			kind: "parsed",
			brief:
				"Maximum number of applications to return per page. Defaults to all, or 100 when `page_token` is set.",
			optional: true,
			parse: Number,
		},
		"page-token": {
			kind: "parsed",
			brief: "Opaque token from a previous response to retrieve the next page.",
			optional: true,
			parse: String,
		},
		name: {
			kind: "parsed",
			brief: "Filter applications by name.",
			optional: true,
			parse: String,
		},
		image: {
			kind: "parsed",
			brief: "Filter applications by image.",
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
	describe: "List Applications associated with your account",
	usage:
		"$0 containers applications list\n\nLists all the applications that are associated with your account.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
