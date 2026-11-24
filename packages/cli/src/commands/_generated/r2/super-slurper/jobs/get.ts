/**
 * get command
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
	command: "get <job-id>",
	describe: "Get job details",
	usage:
		"$0 r2 super-slurper jobs get <job-id>\n\nRetrieves detailed status and configuration for a specific R2 Super Slurper migration job.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
