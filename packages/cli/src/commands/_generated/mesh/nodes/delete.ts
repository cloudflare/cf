/**
 * delete command
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
		force: {
			kind: "boolean",
			brief: "Skip confirmation (useful in scripts and CI)",
			alias: "f",
			default: false,
		},
	},
	operands: [
		{ placeholder: "node-id", brief: "UUID of the tunnel.", parse: String },
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "delete <node-id>",
	describe: "Delete a Mesh node",
	usage:
		"$0 mesh nodes delete <node-id>\n\nDeletes a Mesh node from an account.",
	...parameters,
	loader: () => import("./delete.handler.js"),
});

export default command;
