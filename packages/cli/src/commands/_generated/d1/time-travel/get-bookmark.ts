/**
 * get-bookmark command
 * @generated from apis/overlays/d1.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		timestamp: {
			kind: "parsed",
			brief:
				"An optional ISO 8601 timestamp. If provided, returns the nearest available bookmark at or before this timestamp. If omitted, returns the current bookmark.",
			optional: true,
			parse: String,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [
		{
			placeholder: "database-id",
			brief: "D1 database identifier (UUID).",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get-bookmark <database-id>",
	describe: "Get D1 database bookmark",
	usage:
		"$0 d1 time-travel get-bookmark <database-id>\n\nRetrieve the current bookmark, or the nearest bookmark at or before a provided timestamp. Bookmarks can be used with the restore endpoint to revert the database to a previous point in time.",
	...parameters,
	loader: () => import("./get-bookmark.handler.js"),
});

export default command;
