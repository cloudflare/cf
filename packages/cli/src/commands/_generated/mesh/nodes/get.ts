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
		{ placeholder: "node-id", brief: "UUID of the tunnel.", parse: String },
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <node-id>",
	describe: "Get a Mesh node",
	usage: "$0 mesh nodes get <node-id>\n\nFetches a single Mesh node.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
