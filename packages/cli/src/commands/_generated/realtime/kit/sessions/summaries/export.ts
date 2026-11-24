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
	command: "export <session-id>",
	describe: "Fetch summary of transcripts for a session",
	usage:
		"$0 realtime kit sessions summaries export <session-id>\n\nReturns a Summary URL to download the Summary of Transcripts for the session ID as plain text.",
	...parameters,
	loader: () => import("./export.handler.js"),
});

export default command;
