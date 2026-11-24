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
		search: {
			kind: "parsed",
			brief:
				"The search query string. You can search using the meeting ID or title.",
			optional: true,
			parse: String,
		},
		status: {
			kind: "enum",
			brief: "Filter meetings by status.",
			values: ["ACTIVE", "INACTIVE"],
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
	describe: "Fetch all meetings for an App",
	usage:
		"$0 realtime kit meetings list\n\nReturns all meetings for the given App ID.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
