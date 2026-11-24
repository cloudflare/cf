/**
 * update command
 * @generated from apis/overlays/waiting-rooms.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
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
		{ placeholder: "waiting-room-id", brief: "Waiting room ID", parse: String },
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "update <waiting-room-id>",
	describe: "Replace Waiting Room Rules",
	usage:
		"$0 waiting-rooms rules update <waiting-room-id>\n\nOnly available for the Waiting Room Advanced subscription. Replaces all rules for a waiting room.",
	...parameters,
	loader: () => import("./update.handler.js"),
});

export default command;
