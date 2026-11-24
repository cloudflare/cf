/**
 * legacy-get command
 * @generated from apis/overlays/pipelines.ts
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
			placeholder: "pipeline-name",
			brief: "Defines the name of the pipeline.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "legacy-get <pipeline-name>",
	describe: "[DEPRECATED] Get Pipeline",
	usage:
		"$0 pipelines legacy-get <pipeline-name>\n\n[DEPRECATED] Get configuration of a pipeline. Use the new /pipelines/v1/pipelines endpoint instead.",
	...parameters,
	loader: () => import("./legacy-get.handler.js"),
});

export default command;
