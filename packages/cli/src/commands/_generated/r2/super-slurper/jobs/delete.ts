/**
 * delete command
 * @generated from apis/overlays/r2.ts
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
	operands: [{ placeholder: "job-id", brief: "Job ID", parse: String }],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "delete <job-id>",
	describe: "Delete a job",
	usage:
		"$0 r2 super-slurper jobs delete <job-id>\n\nDeletes a completed, aborted, or errored R2 Super Slurper migration job. Active jobs cannot be deleted.",
	...parameters,
	loader: () => import("./delete.handler.js"),
});

export default command;
