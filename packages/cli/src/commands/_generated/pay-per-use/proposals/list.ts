/**
 * list command
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
	command: "list",
	describe: "List pay-per-use price proposals",
	usage:
		"$0 pay-per-use proposals list\n\nLists a paginated set of outstanding pay-per-use publisher price proposals for an operator. Listing remains available while the operator is disabled or its name is unverified so proposals can be rejected.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
