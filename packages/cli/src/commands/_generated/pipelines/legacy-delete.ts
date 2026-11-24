/**
 * legacy-delete command
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
		force: {
			kind: "boolean",
			brief: "Skip confirmation (useful in scripts and CI)",
			alias: "f",
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
	command: "legacy-delete <pipeline-name>",
	describe: "[DEPRECATED] Delete Pipeline",
	usage:
		"$0 pipelines legacy-delete <pipeline-name>\n\n[DEPRECATED] Delete a pipeline. Use the new /pipelines/v1/pipelines endpoint instead.",
	...parameters,
	loader: () => import("./legacy-delete.handler.js"),
});

export default command;
