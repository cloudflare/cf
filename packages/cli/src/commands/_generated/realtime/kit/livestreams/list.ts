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
		"exclude-meetings": {
			kind: "boolean",
			brief: "Exclude the RealtimeKit meetings that are livestreamed.",
			optional: true,
		},
		"per-page": {
			kind: "parsed",
			brief: "Number of results per page.",
			optional: true,
			parse: Number,
		},
		"page-no": {
			kind: "parsed",
			brief:
				"The page number from which you want your page search results to be displayed.",
			optional: true,
			parse: Number,
		},
		status: {
			kind: "enum",
			brief: "Specifies the status of the operation.",
			values: ["LIVE", "IDLE", "ERRORED", "INVOKED"],
			optional: true,
		},
		"start-time": {
			kind: "parsed",
			brief:
				"Specify the start time range in ISO format to access the live stream.",
			optional: true,
			parse: String,
		},
		"end-time": {
			kind: "parsed",
			brief:
				"Specify the end time range in ISO format to access the live stream.",
			optional: true,
			parse: String,
		},
		"sort-order": {
			kind: "enum",
			brief: "Specifies the sorting order for the results.",
			values: ["ASC", "DSC"],
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
	describe: "Fetch all livestreams",
	usage:
		"$0 realtime kit livestreams list\n\nReturns details of livestreams associated with the given App ID. It includes livestreams created by your App and RealtimeKit meetings that are livestreamed by your App. If you only want details of livestreams created by your App and not RealtimeKit meetings, you can use the `exclude_meetings` query parameter.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
