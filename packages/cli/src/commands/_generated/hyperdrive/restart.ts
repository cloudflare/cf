/**
 * restart command
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
	command: "restart <hyperdrive-id>",
	describe: "Restart Hyperdrive",
	usage:
		"$0 hyperdrive restart <hyperdrive-id>\n\nRestarts the connection pool for the specified Hyperdrive configuration without changing its configuration. Existing connections are drained and a new pool is established at the edge.",
	...parameters,
	loader: () => import("./restart.handler.js"),
});

export default command;
