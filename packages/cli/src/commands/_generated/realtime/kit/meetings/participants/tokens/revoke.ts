/**
 * revoke command
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
		token: {
			kind: "parsed",
			brief: "The participant authentication token to revoke.",
			optional: true,
			parse: String,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		force: {
			kind: "boolean",
			brief: "Skip confirmation (useful in scripts and CI)",
			alias: "f",
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
	command: "revoke <participant-id>",
	describe: "Revoke participant's authentication token",
	usage:
		"$0 realtime kit meetings participants tokens revoke <participant-id>\n\nRevokes a previously issued participant authentication token without deleting the participant. Other tokens issued to the participant remain valid.",
	...parameters,
	loader: () => import("./revoke.handler.js"),
});

export default command;
