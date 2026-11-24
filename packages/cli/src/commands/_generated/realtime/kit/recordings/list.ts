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
		"meeting-id": {
			kind: "parsed",
			brief:
				"ID of a meeting. Optional. Will limit results to only this meeting if passed.",
			optional: true,
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
		expired: {
			kind: "boolean",
			brief:
				"If passed, only shows expired/non-expired recordings on RealtimeKit's bucket",
			optional: true,
		},
		search: {
			kind: "parsed",
			brief:
				"The search query string. You can search using the meeting ID or title.",
			optional: true,
			parse: String,
		},
		"sort-by": {
			kind: "enum",
			brief: "Sort by",
			values: ["invokedTime"],
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
		status: {
			kind: "parsed",
			brief: "Filter by one or more recording status",
			variadic: true,
			optional: true,
			choices: [
				"INVOKED",
				"RECORDING",
				"UPLOADING",
				"UPLOADED",
				"ERRORED",
				"PAUSED",
			],
			parse: String,
			coerce: (values: string[]) => values.flatMap((value) => value.split(",")),
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
	describe: "Fetch all recordings for an App",
	usage:
		"$0 realtime kit recordings list\n\nReturns all recordings for an App. If the `meeting_id` parameter is passed, returns all recordings for the given meeting ID.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
