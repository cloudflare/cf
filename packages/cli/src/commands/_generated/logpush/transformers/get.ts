/**
 * get command
 * @generated from apis/overlays/logpush.ts
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
			placeholder: "transformer-id",
			brief: "The transformer ID.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <transformer-id>",
	describe: "Get transformer",
	usage:
		"$0 logpush transformers get <transformer-id>\n\nGets a single custom log transformer by ID.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
