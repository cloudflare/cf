/**
 * progress command
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
	command: "progress <job-id>",
	describe: "Get job progress",
	usage:
		"$0 r2 super-slurper jobs progress <job-id>\n\nRetrieves current progress metrics for an R2 Super Slurper migration job",
	...parameters,
	loader: () => import("./progress.handler.js"),
});

export default command;
