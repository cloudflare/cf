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
			brief: "A page number within the paginated result set.",
			optional: true,
			parse: Number,
		},
		"per-page": {
			kind: "parsed",
			brief: "Number of results to return per page.",
			optional: true,
			parse: Number,
		},
		status: {
			kind: "enum",
			brief: "Filter on export job's status",
			values: ["Pending", "Success", "Failure", "Rescheduled", "In-Progress"],
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
	describe: "List all export jobs",
	usage:
		"$0 zero-trust casb exports list\n\nList all export jobs for a given requestor's organization",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
