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
		"version-id": {
			kind: "parsed",
			brief:
				"Specific version ID to retrieve. When omitted, the latest version is returned.",
			optional: true,
			parse: Number,
		},
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
	describe: "Get transformer content",
	usage:
		"$0 logpush transformers content get <transformer-id>\n\nReturns the SQL query content for a transformer. Without query params, returns the latest version. With `version_id`, returns the specified version.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
