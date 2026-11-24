/**
 * get command
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
	},
	operands: [
		{ placeholder: "waiting-room-id", brief: "Waiting room ID", parse: String },
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <waiting-room-id>",
	describe: "Waiting room details",
	usage:
		"$0 waiting-rooms get <waiting-room-id>\n\nFetches a single configured waiting room.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
