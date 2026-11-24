/**
 * list command
 * @generated from apis/overlays/audit-logs.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		id: {
			kind: "parsed",
			brief: "Finds a specific log by its ID.",
			optional: true,
			parse: String,
		},
		export: {
			kind: "boolean",
			brief: "Indicates that this request is an export of logs in CSV format.",
			optional: true,
		},
		"action-type": {
			kind: "parsed",
			brief: "Filters by the action type.",
			optional: true,
			parse: String,
		},
		"actor-ip": {
			kind: "parsed",
			brief:
				"Filters by the IP address of the request that made the change by specific IP address or valid CIDR Range.",
			optional: true,
			parse: String,
		},
		"actor-email": {
			kind: "parsed",
			brief: "Filters by the email address of the actor that made the change.",
			optional: true,
			parse: String,
		},
		since: { kind: "parsed", brief: "Since", optional: true, parse: String },
		before: { kind: "parsed", brief: "Before", optional: true, parse: String },
		"zone-name": {
			kind: "parsed",
			brief: "Filters by the name of the zone associated to the change.",
			optional: true,
			parse: String,
		},
		direction: {
			kind: "enum",
			brief: "Changes the direction of the chronological sorting.",
			values: ["desc", "asc"],
			optional: true,
		},
		"per-page": {
			kind: "parsed",
			brief: "Sets the number of results to return per page.",
			optional: true,
			parse: Number,
		},
		page: {
			kind: "parsed",
			brief: "Defines which page of results to return.",
			optional: true,
			parse: Number,
		},
		"hide-user-logs": {
			kind: "boolean",
			brief: "Indicates whether or not to hide user level audit logs.",
			optional: true,
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
	describe: "Get account audit logs",
	usage:
		"$0 audit-logs list\n\nGets a list of audit logs for an account. Can be filtered by who made the change, on which zone, and the timeframe of the change.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
