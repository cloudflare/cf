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
		anonymous: {
			kind: "boolean",
			brief: "if voters on a poll are anonymous",
			optional: true,
		},
		"hide-votes": {
			kind: "boolean",
			brief: "if votes on an option are visible before a person votes",
			optional: true,
		},
		options: {
			kind: "parsed",
			brief: "Different options for the question",
			variadic: true,
			optional: true,
			parse: String,
		},
		question: {
			kind: "parsed",
			brief: "Question of the poll",
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
			brief: "Request body for creating a new poll",
			optional: true,
			parse: String,
		},
	},
	operands: [
		{ placeholder: "meeting-id", brief: "ID of the meeting", parse: String },
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "create <meeting-id>",
	describe: "Create a poll",
	usage:
		"$0 realtime kit meetings active polls create <meeting-id>\n\nCreates a new poll in an active session for the given meeting ID.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;
