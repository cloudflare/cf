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
		limit: {
			kind: "parsed",
			brief:
				"Number of results to return. Defaults to 25; values are clamped to 1–250.",
			optional: true,
			parse: Number,
		},
		offset: {
			kind: "parsed",
			brief:
				"Number of results to skip. Defaults to 0; negative values are clamped to 0. Ignored when `cursor` is provided.",
			optional: true,
			parse: Number,
		},
		cursor: {
			kind: "parsed",
			brief:
				"Opaque value from `result_info.cursor` of the previous response. Returns the\ncategories that follow it. `limit` may change between requests. An empty value\nis the same as no cursor. A modified cursor, or one returned by a different list,\nreturns `400`.",
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
	describe: "List application categories",
	usage:
		"$0 accounts categories list\n\nList the categories available for classifying applications, ordered by name, ignoring the case of the letters A to Z. Results are paginated by `offset` or `cursor`.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
