/**
 * list command
 * @generated from apis/overlays/email-security.ts
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
			brief: "Current page within paginated list of results.",
			optional: true,
			parse: Number,
		},
		"per-page": {
			kind: "parsed",
			brief: "The number of results per page. Maximum value is 1000.",
			optional: true,
			parse: Number,
		},
		"action-type": {
			kind: "enum",
			brief: "Filter jobs by the action they perform.",
			values: ["MOVE", "RELEASE"],
			optional: true,
		},
		status: {
			kind: "enum",
			brief: "Filter jobs by their processing status.",
			values: [
				"PENDING",
				"DISCOVERING",
				"PROCESSING",
				"COMPLETED",
				"FAILED",
				"CANCELLED",
			],
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
	describe: "List bulk action jobs",
	usage:
		"$0 email-security bulk-actions list\n\nReturns a paginated list of bulk action jobs for the account.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
