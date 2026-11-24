/**
 * get command
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
			placeholder: "pipeline-id",
			brief: "Specifies the public ID of the pipeline.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <pipeline-id>",
	describe: "Get Pipeline Details",
	usage: "$0 pipelines get <pipeline-id>\n\nGet Pipeline details.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
