/**
 * export command
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
		format: {
			kind: "enum",
			brief: "Transcript file format to fetch.",
			values: ["SRT", "VTT", "JSON", "CSV"],
			optional: true,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [
		{ placeholder: "session-id", brief: "ID of the session", parse: String },
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "export <session-id>",
	describe: "Fetch the complete transcript for a session",
	usage:
		"$0 realtime kit sessions transcripts export <session-id>\n\nReturns a URL to download the transcript for the session ID in the requested format.",
	...parameters,
	loader: () => import("./export.handler.js"),
});

export default command;
