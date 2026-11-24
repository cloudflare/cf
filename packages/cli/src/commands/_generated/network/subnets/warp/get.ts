/**
 * get command
 * @generated from apis/overlays/network.ts
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
			placeholder: "subnet-id",
			brief: "The UUID of the subnet.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <subnet-id>",
	describe: "Get WARP IP subnet",
	usage:
		"$0 network subnets warp get <subnet-id>\n\nGet a WARP IP assignment subnet.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
