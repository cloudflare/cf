/**
 * get command
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
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [{ placeholder: "session-id", brief: "Session ID", parse: String }],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <session-id>",
	describe: "Fetch livestream session details using a session ID",
	usage:
		"$0 realtime kit sessions livestreams get <session-id>\n\nReturns livestream session details for the given session ID. Retreive the session ID using the `Fetch all sessions of an App` API.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
