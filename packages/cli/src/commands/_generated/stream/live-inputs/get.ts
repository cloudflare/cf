/**
 * get command
 * @generated from apis/overlays/stream.ts
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
			placeholder: "live-input-identifier",
			brief: "A unique identifier for a live input.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <live-input-identifier>",
	describe: "Retrieve a live input",
	usage:
		"$0 stream live-inputs get <live-input-identifier>\n\nRetrieves details of an existing live input.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
