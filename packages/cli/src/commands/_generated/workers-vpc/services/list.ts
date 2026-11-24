/**
 * list command
 * @generated from apis/overlays/workers-vpc.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		type: {
			kind: "enum",
			brief: "Type",
			values: ["tcp", "http"],
			optional: true,
		},
		page: {
			kind: "parsed",
			brief: "Current page in the response",
			optional: true,
			parse: Number,
		},
		"per-page": {
			kind: "parsed",
			brief: "Max amount of entries returned per page",
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
	describe: "List Workers VPC connectivity services",
	usage:
		"$0 workers-vpc services list\n\nLists the Workers VPC connectivity services in the account.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
