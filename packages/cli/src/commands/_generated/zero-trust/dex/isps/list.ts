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
		"device-id": {
			kind: "parsed",
			brief: "Device-specific ID, given as UUID.",
			parse: String,
		},
		page: {
			kind: "parsed",
			brief:
				"Page number of paginated results. Mutually exclusive with cursor.",
			optional: true,
			parse: Number,
		},
		"per-page": {
			kind: "parsed",
			brief: "Number of items per page",
			parse: Number,
		},
		cursor: {
			kind: "parsed",
			brief:
				"Cursor for cursor-based pagination. Mutually exclusive with page.",
			optional: true,
			parse: String,
		},
		"sort-by": {
			kind: "enum",
			brief: "The field to sort results by.",
			values: ["time_start"],
			optional: true,
		},
		"sort-order": {
			kind: "enum",
			brief: "The order to sort results.",
			values: ["ASC", "DESC"],
			optional: true,
		},
		from: {
			kind: "parsed",
			brief: "Start time for the query in ISO 8601 format.",
			optional: true,
			parse: String,
		},
		to: {
			kind: "parsed",
			brief: "End time for the query in ISO 8601 format.",
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
	describe: "List device ISPs",
	usage:
		"$0 zero-trust dex isps list\n\nList ISP information observed for a specific device during traceroute tests.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
