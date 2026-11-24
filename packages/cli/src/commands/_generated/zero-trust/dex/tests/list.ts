/**
 * list command
 * @generated from apis/overlays/zero-trust.ts
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
		"per-page": {
			kind: "parsed",
			brief: "Number of results per page.",
			optional: true,
			parse: Number,
		},
		"test-name": {
			kind: "parsed",
			brief: "Filter by test name.",
			optional: true,
			parse: String,
		},
		kind: {
			kind: "enum",
			brief: "Filter by test type.",
			values: ["http", "traceroute"],
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
	describe: "List Device DEX tests",
	usage: "$0 zero-trust dex tests list\n\nFetch all DEX tests.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
