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
		"session-id": { kind: "parsed", brief: "ID of the session", parse: String },
		search: {
			kind: "parsed",
			brief:
				"The search query string. You can search using participant ID, custom participant ID, or display name.",
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
			brief: "Number of results per page.",
			optional: true,
			parse: Number,
		},
		"sort-order": {
			kind: "enum",
			brief: "Sort order",
			values: ["ASC", "DESC"],
			optional: true,
		},
		"sort-by": {
			kind: "enum",
			brief: "Sort by",
			values: ["joinedAt", "duration"],
			optional: true,
		},
		"include-peer-events": {
			kind: "boolean",
			brief: "if true, response includes all the peer events of participants.",
			optional: true,
		},
		view: {
			kind: "enum",
			brief:
				"In breakout room sessions, the view parameter can be set to `raw` for session specific duration for participants or `consolidated` to accumulate breakout room durations.",
			values: ["raw", "consolidated"],
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
	describe: "Fetch participants list of a session",
	usage:
		"$0 realtime kit sessions participants list\n\nReturns a list of participants for the given session ID.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
