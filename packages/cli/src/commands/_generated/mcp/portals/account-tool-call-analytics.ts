/**
 * account-tool-call-analytics command
 * @generated from apis/overlays/mcp.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		granularity: {
			kind: "enum",
			brief: "Granularity",
			values: ["daily", "monthly"],
			optional: true,
		},
		aggregate: {
			kind: "enum",
			brief: "Aggregate",
			values: ["true", "false"],
			optional: true,
		},
		tz: { kind: "parsed", brief: "Tz", optional: true, parse: String },
		days: {
			kind: "parsed",
			brief:
				"Daily trailing-window size; defaults to 7 and is ignored for monthly",
			optional: true,
			parse: Number,
		},
		"response-status": {
			kind: "enum",
			brief: "Response status to count; 'all' counts every status",
			values: ["success", "error", "cached", "all"],
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
	command: "account-tool-call-analytics",
	describe: "Account-global MCP tool-call timeseries",
	usage:
		"$0 mcp portals account-tool-call-analytics\n\nReturns daily or monthly tool-call counts across the account.",
	...parameters,
	loader: () => import("./account-tool-call-analytics.handler.js"),
});

export default command;
