/**
 * get command
 * @generated from apis/overlays/mesh.ts
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
		{ placeholder: "tunnel-id", brief: "UUID of the tunnel.", parse: String },
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <tunnel-id>",
	describe: "Get Mesh node HA configuration",
	usage:
		"$0 mesh nodes configurations get <tunnel-id>\n\nGets the high-availability configuration for a Mesh node.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
