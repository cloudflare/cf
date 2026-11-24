/**
 * get command
 * @generated from apis/overlays/hyperdrive.ts
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
			placeholder: "hyperdrive-id",
			brief: "The unique identifier of the Hyperdrive configuration.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <hyperdrive-id>",
	describe: "Get Hyperdrive",
	usage:
		"$0 hyperdrive get <hyperdrive-id>\n\nReturns the specified Hyperdrive configuration.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
