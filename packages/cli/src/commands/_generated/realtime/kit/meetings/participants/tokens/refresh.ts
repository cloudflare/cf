/**
 * refresh command
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
		"expires-on": {
			kind: "parsed",
			brief:
				"RFC 3339 timestamp with a timezone at or after which the token cannot be used. Must be in the future. Defaults to not_before plus 100 days.",
			optional: true,
			parse: String,
		},
		"not-before": {
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
			brief:
				"Validity window of the participant authentication token. The window is [not_before, expires_on) and cannot be longer than 100 days. Defaults to a token valid from now for 100 days.",
			optional: true,
			parse: String,
		},
	},
	operands: [
		{
			placeholder: "participant-id",
			brief:
				"ID of the participant. You can fetch the participant ID using the add a  participant API.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "refresh <participant-id>",
	describe: "Refresh participant's authentication token",
	usage:
		"$0 realtime kit meetings participants tokens refresh <participant-id>\n\nRegenerates participant's authentication token for the given meeting and participant ID.",
	...parameters,
	loader: () => import("./refresh.handler.js"),
});

export default command;
