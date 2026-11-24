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
		"session-id": { kind: "parsed", brief: "ID of the session", parse: String },
		"include-peer-events": {
			kind: "boolean",
			brief: "if true, response includes all the peer events of participant.",
			optional: true,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [
		{
			placeholder: "participant-id",
			brief: "ID of the participant",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <participant-id>",
	describe: "Fetch details of a participant",
	usage:
		"$0 realtime kit sessions participants get <participant-id>\n\nReturns details of the given participant ID for the given session ID. Use the peer report endpoint to retrieve call statistics.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
