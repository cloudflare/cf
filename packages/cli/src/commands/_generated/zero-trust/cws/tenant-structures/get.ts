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
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [
		{
			placeholder: "structure-id",
			brief: "ID of the tenant structure to retrieve",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <structure-id>",
	describe: "Get a tenant structure by ID",
	usage:
		"$0 zero-trust cws tenant-structures get <structure-id>\n\nReturns the tenant structure with the specified ID.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
