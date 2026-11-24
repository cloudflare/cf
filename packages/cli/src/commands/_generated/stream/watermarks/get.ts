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
			placeholder: "identifier",
			brief: "The unique identifier for a watermark profile.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <identifier>",
	describe: "Watermark profile details",
	usage:
		"$0 stream watermarks get <identifier>\n\nRetrieves details for a single watermark profile.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
