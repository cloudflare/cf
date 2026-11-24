/**
 * update-tables command
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
	command: "update-tables <pipeline-id>",
	describe: "Update Pipeline Tables",
	usage:
		"$0 pipelines update-tables <pipeline-id>\n\nMove a Pipeline to the latest version of every stream and sink it uses, such as after updating a Sink. A running Pipeline restarts on the latest versions from a final checkpoint; a paused or stopped Pipeline uses them once it starts.",
	...parameters,
	loader: () => import("./update-tables.handler.js"),
});

export default command;
