/**
 * pause command
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
	command: "pause <job-id>",
	describe: "Pause a job",
	usage:
		"$0 r2 super-slurper jobs pause <job-id>\n\nPauses a running R2 Super Slurper migration job. The job can be resumed later to continue transferring.",
	...parameters,
	loader: () => import("./pause.handler.js"),
});

export default command;
