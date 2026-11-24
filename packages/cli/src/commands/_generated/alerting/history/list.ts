/**
 * list command
 * @generated from apis/overlays/alerting.ts
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
			brief: "Number of items per page.",
			optional: true,
			parse: Number,
		},
		before: {
			kind: "parsed",
			brief:
				"Limit the returned results to history records older than the specified date. This must be a timestamp that conforms to RFC3339.",
			optional: true,
			parse: String,
		},
		page: {
			kind: "parsed",
			brief: "Page number of paginated results.",
			optional: true,
			parse: Number,
		},
		since: {
			kind: "parsed",
			brief:
				"Limit the returned results to history records newer than the specified date. This must be a timestamp that conforms to RFC3339.",
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
	describe: "List History",
	usage:
		"$0 alerting history list\n\nGets a list of history records for notifications sent to an account. The records are displayed for last `x` number of days based on the zone plan (free = 30, pro = 30, biz = 30, ent = 90).",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
