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
		"per-page": {
			kind: "parsed",
			brief:
				"The maximum number of results per page. You can only set the value to `1` or to a multiple of 5 such as `5`, `10`, `15`, or `20`.",
			optional: true,
			parse: Number,
		},
		"user-agent": {
			kind: "parsed",
			brief:
				"A string to search for in the user agent values of existing rules.",
			optional: true,
			parse: String,
		},
		paused: {
			kind: "boolean",
			brief: "When true, indicates that the rule is currently paused.",
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
	describe: "List User Agent Blocking rules",
	usage:
		"$0 firewall ua-rules list\n\nFetches User Agent Blocking rules in a zone. You can filter the results using several optional parameters.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
