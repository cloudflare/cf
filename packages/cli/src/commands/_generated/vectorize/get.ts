/**
 * get command
 * @generated from apis/overlays/vectorize.ts
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
	operands: [{ placeholder: "index-name", brief: "Index name", parse: String }],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <index-name>",
	describe: "Get Vectorize Index",
	usage:
		"$0 vectorize get <index-name>\n\nReturns the specified Vectorize Index.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
