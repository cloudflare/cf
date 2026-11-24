/**
 * delete command
 * @generated from apis/overlays/browser-run.ts
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
			brief: "The ID of the crawl job to cancel.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "delete <job-id>",
	describe: "Cancel a crawl job.",
	usage:
		"$0 browser-run crawl delete <job-id>\n\nCancels an ongoing crawl job by setting its status to cancelled and stopping all queued URLs.",
	...parameters,
	loader: () => import("./delete.handler.js"),
});

export default command;
