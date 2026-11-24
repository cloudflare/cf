/**
 * get command
 * @generated from apis/overlays/zero-trust.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"structure-id": {
			kind: "parsed",
			brief: "ID of the parent tenant structure",
			parse: String,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [
		{
			placeholder: "node-id",
			brief: "ID of the node to retrieve",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <node-id>",
	describe: "Get a tenant node by ID",
	usage:
		"$0 zero-trust cws tenant-structures nodes get <node-id>\n\nReturns the tenant node with the specified ID.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
