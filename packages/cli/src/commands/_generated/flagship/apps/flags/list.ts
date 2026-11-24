/**
 * list command
 * @generated from apis/overlays/flagship.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"app-id": {
			kind: "parsed",
			brief: "Flagship app ID returned when the app was created.",
			parse: String,
		},
		limit: {
			kind: "parsed",
			brief: "Max items to return (1–200).",
			optional: true,
			parse: Number,
		},
		cursor: {
			kind: "parsed",
			brief: "Pagination cursor from a previous response.",
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
	describe: "List flags",
	usage:
		"$0 flagship apps flags list\n\nLists an app's flags ordered by key. Pass `cursor` from `result_info` to page forward; a null cursor indicates the last page.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
