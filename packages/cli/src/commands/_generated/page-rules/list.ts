/**
 * list command
 * @generated from apis/overlays/page-rules.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		order: {
			kind: "enum",
			brief: "The field used to sort returned Page Rules.",
			values: ["status", "priority"],
			optional: true,
		},
		direction: {
			kind: "enum",
			brief: "The direction used to sort returned Page Rules.",
			values: ["asc", "desc"],
			optional: true,
		},
		match: {
			kind: "enum",
			brief:
				"When set to `all`, all the search requirements must match. When set to `any`, only one of the search requirements has to match.",
			values: ["any", "all"],
			optional: true,
		},
		status: {
			kind: "enum",
			brief: "The status of the Page Rule.",
			values: ["active", "disabled"],
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
	describe: "List Page Rules",
	usage: "$0 page-rules list\n\nFetches Page Rules in a zone.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
