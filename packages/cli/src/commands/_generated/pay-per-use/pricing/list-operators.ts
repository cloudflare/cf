/**
 * list-operators command
 * @generated from apis/overlays/pay-per-use.ts
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
			brief: "Page number.",
			optional: true,
			parse: Number,
		},
		"per-page": {
			kind: "parsed",
			brief: "Results per page.",
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
	command: "list-operators",
	describe: "List pay-per-use operators",
	usage:
		"$0 pay-per-use pricing list-operators\n\nLists a paginated set of enabled pay-per-use operators with verified names, matching billing classification, and their prices for a zone.",
	...parameters,
	loader: () => import("./list-operators.handler.js"),
});

export default command;
