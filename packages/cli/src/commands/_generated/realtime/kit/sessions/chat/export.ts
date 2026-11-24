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
	operands: [
		{ placeholder: "session-id", brief: "ID of the session", parse: String },
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "export <session-id>",
	describe: "Fetch all chat messages of a session",
	usage:
		"$0 realtime kit sessions chat export <session-id>\n\nReturns a URL to download all chat messages of the session ID in CSV format.",
	...parameters,
	loader: () => import("./export.handler.js"),
});

export default command;
