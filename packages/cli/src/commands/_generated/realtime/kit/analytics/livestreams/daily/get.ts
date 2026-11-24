/**
 * get command
 * @generated from apis/overlays/realtime.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"start-time": {
			kind: "parsed",
			brief:
				"Specify the start time as a Unix timestamp in seconds to access the livestream analytics.",
			optional: true,
			parse: Number,
		},
		"end-time": {
			kind: "parsed",
			brief:
				"Specify the end time as a Unix timestamp in seconds to access the livestream analytics.",
			optional: true,
			parse: Number,
		},
		filters: {
			kind: "parsed",
			brief: "Optional filters for livestream analytics.",
			optional: true,
			parse: String,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [
		{ placeholder: "app-id", brief: "The app identifier tag.", parse: String },
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <app-id>",
	describe: "Fetch day-wise analytics data for your livestreams",
	usage:
		"$0 realtime kit analytics livestreams daily get <app-id>\n\nReturns day-wise livestream analytics for the specified time range.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
