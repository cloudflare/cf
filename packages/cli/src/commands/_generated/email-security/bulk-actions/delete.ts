/**
 * delete command
 * @generated from apis/overlays/email-security.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		force: {
			kind: "boolean",
			brief: "Skip confirmation (useful in scripts and CI)",
			alias: "f",
			default: false,
		},
	},
	operands: [
		{
			placeholder: "job-id",
			brief: "Identifier of the bulk action job.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "delete <job-id>",
	describe: "Delete a bulk action job",
	usage:
		"$0 email-security bulk-actions delete <job-id>\n\nDeletes the job, removing it from all list and detail endpoints. Only jobs in a terminal state (`COMPLETED`, `CANCELLED`, or `FAILED`) can be deleted. To stop an in-progress job without removing it, use the cancel endpoint instead.",
	...parameters,
	loader: () => import("./delete.handler.js"),
});

export default command;
