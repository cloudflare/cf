/**
 * get command
 * @generated from apis/overlays/intel.ts
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
			placeholder: "sinkhole-id",
			brief: "The unique identifier for the sinkhole.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <sinkhole-id>",
	describe: "Get a sinkhole",
	usage:
		"$0 intel sinkholes get <sinkhole-id>\n\nGet the specified sinkhole by its unique identifier.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
