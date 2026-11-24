/**
 * delete command
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
		force: {
			kind: "boolean",
			brief: "Skip confirmation (useful in scripts and CI)",
			alias: "f",
			default: false,
		},
	},
	operands: [
		{ placeholder: "waiting-room-id", brief: "Waiting room ID", parse: String },
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "delete <waiting-room-id>",
	describe: "Delete waiting room",
	usage: "$0 waiting-rooms delete <waiting-room-id>\n\nDeletes a waiting room.",
	...parameters,
	loader: () => import("./delete.handler.js"),
});

export default command;
