/**
 * list command
 * @generated from apis/overlays/acm.ts
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
			brief: "Number of records per page.",
			optional: true,
			parse: Number,
		},
		limit: {
			kind: "parsed",
			brief: "Limit to the number of records returned.",
			optional: true,
			parse: Number,
		},
		offset: {
			kind: "parsed",
			brief: "Offset the results.",
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
	describe: "List Custom Origin Trust Store Details",
	usage:
		"$0 acm custom-trust-store list\n\nGet Custom Origin Trust Store for a Zone.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
