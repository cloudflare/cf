/**
 * cancel command
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
	},
	operands: [
		{
			placeholder: "job-id",
			brief: "Identifier of the bulk action job to cancel.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "cancel <job-id>",
	describe: "Cancel a bulk action job",
	usage:
		"$0 email-security bulk-actions cancel <job-id>\n\nCancels the job, marking it as cancelled and stopping any pending message processing. The job record remains visible in list and detail endpoints.",
	...parameters,
	loader: () => import("./cancel.handler.js"),
});

export default command;
