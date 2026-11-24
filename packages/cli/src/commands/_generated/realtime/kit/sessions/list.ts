/**
 * list command
 * @generated from apis/overlays/realtime.ts
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
			brief: "The app identifier tag.",
			parse: String,
		},
		"page-no": {
			kind: "parsed",
			brief:
				"The page number from which you want your page search results to be displayed.",
			optional: true,
			parse: Number,
		},
		"per-page": {
			kind: "parsed",
			brief: "Number of results per page",
			optional: true,
			parse: Number,
		},
		"sort-by": {
			kind: "enum",
			brief: "Sort by",
			values: ["minutesConsumed", "createdAt"],
			optional: true,
		},
		"sort-order": {
			kind: "enum",
			brief: "Sort order",
			values: ["ASC", "DESC"],
			optional: true,
		},
		"start-time": {
			kind: "parsed",
			brief:
				"The start time range for which you want to retrieve the meetings. The time must be specified in ISO format.",
			optional: true,
			parse: String,
		},
		"end-time": {
			kind: "parsed",
			brief:
				"The end time range for which you want to retrieve the meetings. The time must be specified in ISO format.",
			optional: true,
			parse: String,
		},
		participants: {
			kind: "parsed",
			brief: "Participants",
			optional: true,
			parse: String,
		},
		status: {
			kind: "enum",
			brief: "Status",
			values: ["LIVE", "ENDED"],
			optional: true,
		},
		search: {
			kind: "parsed",
			brief:
				"Search string that matches sessions based on meeting title, meeting ID, and session ID",
			optional: true,
			parse: String,
		},
		"associated-id": {
			kind: "parsed",
			brief: "ID of the meeting that sessions should be associated with",
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
	describe: "Fetch all sessions of an App",
	usage:
		"$0 realtime kit sessions list\n\nReturns details of all sessions of an App.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
