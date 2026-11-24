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
			placeholder: "sink-id",
			brief: "Specifies the publid ID of the sink.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <sink-id>",
	describe: "Get Sink Details",
	usage: "$0 pipelines sinks get <sink-id>\n\nGet Sink Details.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
