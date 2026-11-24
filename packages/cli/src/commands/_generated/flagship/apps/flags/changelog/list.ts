/**
 * list command
 * @generated from apis/overlays/flagship.ts
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
			brief: "Flagship app ID returned when the app was created.",
			parse: String,
		},
		"flag-key": {
			kind: "parsed",
			brief: "Case-sensitive key identifying the flag within the app.",
			parse: String,
		},
		limit: {
			kind: "parsed",
			brief: "Max items to return (1–200).",
			optional: true,
			parse: Number,
		},
		cursor: {
			kind: "parsed",
			brief: "Pagination cursor from a previous response.",
			optional: true,
			parse: String,
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
	describe: "List flag changelog entries",
	usage:
		"$0 flagship apps flags changelog list\n\nReturns the audit history for a flag, newest first. Each entry includes the event type and full flag state after the change; `update` entries include a field-level diff. Capped at 200 entries per flag.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
