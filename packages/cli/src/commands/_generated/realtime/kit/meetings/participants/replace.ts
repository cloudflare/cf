/**
 * replace command
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
		"meeting-id": {
			kind: "parsed",
			brief:
				"ID of the meeting. You can fetch the meeting ID using the create a meeting API.",
			parse: String,
		},
		"custom-participant-id": {
			kind: "parsed",
			brief: "Unique participant ID accepted by the replace participant API.",
			optional: true,
			parse: String,
		},
		name: {
			kind: "parsed",
			brief: "(Optional) Name of the participant.",
			optional: true,
			parse: String,
		},
		picture: {
			kind: "parsed",
			brief: "(Optional) A URL to a picture to be used for the participant.",
			optional: true,
			parse: String,
		},
		"preset-name": {
			kind: "parsed",
			brief: "Name of the preset to apply to this participant.",
			optional: true,
			parse: String,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		body: {
			kind: "parsed",
			brief: "Raw JSON request body (bypasses individual flags)",
			optional: true,
			parse: String,
		},
	},
	operands: [
		{
			placeholder: "participant-id",
			brief:
				"ID of the participant. You can fetch the participant ID using the add a participant API.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "replace <participant-id>",
	describe: "Replace a participant's detail",
	usage:
		"$0 realtime kit meetings participants replace <participant-id>\n\nReplaces a participant's details for the given meeting and participant ID.",
	...parameters,
	loader: () => import("./replace.handler.js"),
});

export default command;
