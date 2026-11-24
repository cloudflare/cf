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
		"start-date": {
			kind: "parsed",
			brief: "start date in YYYY-MM-DD format",
			optional: true,
			parse: String,
		},
		"end-date": {
			kind: "parsed",
			brief: "end date in YYYY-MM-DD format",
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
	describe: "Fetch day-wise session and recording analytics data for an App",
	usage:
		"$0 realtime kit analytics usage get <app-id>\n\nReturns day-wise session and recording analytics data of an App for the specified time range start_date to end_date. If start_date and end_date are not provided, the default time range is set from 30 days ago to the current date.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
