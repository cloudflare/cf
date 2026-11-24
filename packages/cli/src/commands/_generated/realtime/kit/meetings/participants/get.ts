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
		"meeting-id": {
			kind: "parsed",
			brief:
				"ID of the meeting. You can fetch the meeting ID using the create a meeting API.",
			parse: String,
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
			brief:
				"ID of the participant. You can fetch the participant ID using the add a participant API.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <participant-id>",
	describe: "Fetch a participant's detail",
	usage:
		"$0 realtime kit meetings participants get <participant-id>\n\nReturns a participant details for the given meeting and participant ID.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
