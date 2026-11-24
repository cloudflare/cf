/**
 * generate command
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
	command: "generate <session-id>",
	describe: "Generate summary of Transcripts for the session",
	usage:
		"$0 realtime kit sessions summaries generate <session-id>\n\nTrigger Summary generation of Transcripts for the session ID.",
	...parameters,
	loader: () => import("./generate.handler.js"),
});

export default command;
