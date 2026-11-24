/**
 * list command
 * @generated from apis/overlays/waiting-rooms.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"waiting-room-id": {
			kind: "parsed",
			brief: "Waiting room ID",
			parse: String,
		},
		page: {
			kind: "parsed",
			brief: "Page number of paginated results.",
			optional: true,
			parse: Number,
		},
		"per-page": {
			kind: "parsed",
			brief: "Maximum number of results per page. Must be a multiple of 5.",
			optional: true,
			parse: Number,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "list",
	describe: "List events",
	usage: "$0 waiting-rooms events list\n\nLists events for a waiting room.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
