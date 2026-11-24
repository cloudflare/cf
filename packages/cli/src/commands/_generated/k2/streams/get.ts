/**
 * get command
 * @generated from apis/overlays/k2.ts
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
			brief: "Specifies the public ID of the K2 stream.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <stream-id>",
	describe: "Get K2 stream",
	usage: "$0 k2 streams get <stream-id>\n\nGet K2 stream details.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
