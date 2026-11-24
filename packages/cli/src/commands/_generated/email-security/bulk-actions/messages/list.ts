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
		"job-id": {
			kind: "parsed",
			brief: "Identifier of the bulk action job whose messages to list.",
			parse: String,
		},
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
		status: {
			kind: "enum",
			brief: "Filter the job's messages by their processing status.",
			values: [
				"PENDING",
				"PROCESSING",
				"COMPLETED",
				"FAILED",
				"CANCELLED",
				"SKIPPED",
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
	describe: "List messages for a bulk action job",
	usage:
		"$0 email-security bulk-actions messages list\n\nReturns the individual messages associated with a bulk action job, including their processing status.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
