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
		start: {
			kind: "parsed",
			brief:
				"Start of the time range (RFC3339). Takes precedence over from_date.",
			optional: true,
			parse: String,
		},
		end: {
			kind: "parsed",
			brief: "End of the time range (RFC3339). Takes precedence over to_date.",
			optional: true,
			parse: String,
		},
		"from-date": {
			kind: "parsed",
			brief:
				"Deprecated, use `start` instead. Start date in YYYY-MM-DD format.",
			optional: true,
			parse: String,
		},
		"to-date": {
			kind: "parsed",
			brief: "Deprecated, use `end` instead. End date in YYYY-MM-DD format.",
			optional: true,
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
	describe: "List PhishGuard reports",
	usage:
		"$0 email-security phishguard reports list\n\nRetrieves PhishGuard security alert reports for a specified date range. Reports include detected threats, dispositions, and contextual information. Use for security monitoring and threat analysis.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
