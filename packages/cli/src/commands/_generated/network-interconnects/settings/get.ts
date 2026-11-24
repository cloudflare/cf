/**
 * get command
 * @generated from apis/overlays/network-interconnects.ts
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
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get",
	describe: "Get the current settings for the active account",
	usage:
		"$0 network-interconnects settings get\n\nRetrieves current settings configuration for the specified resource or service.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
