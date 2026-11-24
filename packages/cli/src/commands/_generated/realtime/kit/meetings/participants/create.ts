/**
 * create command
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
		"custom-participant-id": {
			kind: "parsed",
			brief:
				"A unique participant ID. You must specify a unique ID for the participant, for example, UUID, email address, and so on. ",
			optional: true,
			parse: String,
		},
		name: {
			kind: "parsed",
			brief: "(Optional) Name of the participant. ",
			optional: true,
			parse: String,
		},
		picture: {
			kind: "parsed",
			brief: "(Optional) A URL to a picture to be used for the participant. ",
			optional: true,
			parse: String,
		},
		"preset-name": {
			kind: "parsed",
			brief: "Name of the preset to apply to this participant.",
			default: "group_call_host",
			parse: String,
		},
		"token-expires-on": {
			kind: "parsed",
			brief:
				"RFC 3339 timestamp with a timezone at or after which the token cannot be used. Must be in the future. Defaults to not_before plus 100 days.",
			optional: true,
			parse: String,
		},
		"token-not-before": {
			kind: "parsed",
			brief:
				"RFC 3339 timestamp with a timezone before which the token cannot be used. Defaults to the current time. May be in the past.",
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
			placeholder: "meeting-id",
			brief:
				"ID of the meeting. Fetch the meeting ID using the create a meeting API.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "create <meeting-id>",
	describe: "Add a participant",
	usage:
		"$0 realtime kit meetings participants create <meeting-id>\n\nAdds a participant to the given meeting ID.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;
