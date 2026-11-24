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
	operands: [
		{
			placeholder: "icon",
			brief: "Interconnect name to retrieve information about",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <icon>",
	describe: "Get information about an interconnect object",
	usage:
		"$0 network-interconnects interconnects get <icon>\n\nRetrieves configuration and status details for a specific network interconnect.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
