/**
 * abort command
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
	command: "abort <job-id>",
	describe: "Abort a job",
	usage:
		"$0 r2 super-slurper jobs abort <job-id>\n\nCancels a specific R2 Super Slurper migration job. Any objects in the middle of a transfer will finish, but no new objects will start transferring.",
	...parameters,
	loader: () => import("./abort.handler.js"),
});

export default command;
