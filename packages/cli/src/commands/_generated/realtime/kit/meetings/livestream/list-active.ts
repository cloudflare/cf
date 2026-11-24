/**
 * list-active command
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
		{ placeholder: "meeting-id", brief: "ID of the meeting", parse: String },
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "list-active <meeting-id>",
	describe: "Fetch active livestreams for a meeting",
	usage:
		"$0 realtime kit meetings livestream list-active <meeting-id>\n\nReturns details of all active livestreams for the given meeting ID.",
	...parameters,
	loader: () => import("./list-active.handler.js"),
});

export default command;
