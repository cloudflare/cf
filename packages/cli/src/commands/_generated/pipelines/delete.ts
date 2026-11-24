/**
 * delete command
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
			placeholder: "pipeline-id",
			brief: "Specifies the public ID of the pipeline.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "delete <pipeline-id>",
	describe: "Delete Pipeline",
	usage: "$0 pipelines delete <pipeline-id>\n\nDelete Pipeline in Account.",
	...parameters,
	loader: () => import("./delete.handler.js"),
});

export default command;
