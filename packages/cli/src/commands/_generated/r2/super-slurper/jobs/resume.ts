/**
 * resume command
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
	},
	operands: [{ placeholder: "job-id", brief: "Job ID", parse: String }],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "resume <job-id>",
	describe: "Resume a job",
	usage:
		"$0 r2 super-slurper jobs resume <job-id>\n\nResumes a paused R2 Super Slurper migration job, continuing the transfer from where it stopped.",
	...parameters,
	loader: () => import("./resume.handler.js"),
});

export default command;
