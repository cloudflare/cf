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
			placeholder: "stream-id",
			brief: "Specifies the public ID of the stream.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <stream-id>",
	describe: "Get Stream Details",
	usage: "$0 pipelines streams get <stream-id>\n\nGet Stream Details.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
