/**
 * list command
 * @generated from apis/overlays/email-security.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"investigate-id": {
			kind: "parsed",
			brief: "Unique identifier for a message retrieved from investigation.",
			parse: String,
		},
		page: {
			kind: "parsed",
			brief: "Current page within paginated list of results.",
			optional: true,
			parse: Number,
		},
		"per-page": {
			kind: "parsed",
			brief: "The number of results per page. Maximum value is 1000.",
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
	describe: "List post-delivery actions for a message",
	usage:
		"$0 email-security investigate action-log list\n\nReturns the list of post-delivery actions (moves, quarantine releases, previews, etc.) that have been applied to a specific email message.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
