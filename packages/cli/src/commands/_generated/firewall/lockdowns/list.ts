/**
 * list command
 * @generated from apis/overlays/firewall.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		page: {
			kind: "parsed",
			brief: "Page number of paginated results.",
			optional: true,
			parse: Number,
		},
		description: {
			kind: "parsed",
			brief: "A string to search for in the description of existing rules.",
			optional: true,
			parse: String,
		},
		"modified-on": {
			kind: "parsed",
			brief: "The timestamp of when the rule was last modified.",
			optional: true,
			parse: String,
		},
		ip: {
			kind: "parsed",
			brief: "A single IP address to search for in existing rules.",
			optional: true,
			parse: String,
		},
		priority: {
			kind: "parsed",
			brief:
				"The priority of the rule to control the processing order. A lower number indicates higher priority. If not provided, any rules with a configured priority will be processed before rules without a priority.",
			optional: true,
			parse: Number,
		},
		"uri-search": {
			kind: "parsed",
			brief:
				"A single URI to search for in the list of URLs of existing rules.",
			optional: true,
			parse: String,
		},
		"ip-range-search": {
			kind: "parsed",
			brief: "A single IP address range to search for in existing rules.",
			optional: true,
			parse: String,
		},
		"per-page": {
			kind: "parsed",
			brief:
				"The maximum number of results per page. You can only set the value to `1` or to a multiple of 5 such as `5`, `10`, `15`, or `20`.",
			optional: true,
			parse: Number,
		},
		"created-on": {
			kind: "parsed",
			brief: "The timestamp of when the rule was created.",
			optional: true,
			parse: String,
		},
		"description-search": {
			kind: "parsed",
			brief: "A string to search for in the description of existing rules.",
			optional: true,
			parse: String,
		},
		"ip-search": {
			kind: "parsed",
			brief: "A single IP address to search for in existing rules.",
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
	describe: "List Zone Lockdown rules",
	usage:
		"$0 firewall lockdowns list\n\nFetches Zone Lockdown rules. You can filter the results using several optional parameters.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
