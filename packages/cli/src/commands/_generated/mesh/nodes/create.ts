/**
 * create command
 * @generated from apis/overlays/mesh.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		ha: {
			kind: "boolean",
			brief:
				"Indicates that the tunnel will be created to be highly available. If omitted, defaults to false.",
			optional: true,
		},
		name: {
			kind: "parsed",
			brief: "A user-friendly name for a tunnel.",
			optional: true,
			parse: String,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		body: {
			kind: "parsed",
			brief: "Raw JSON request body (bypasses individual flags)",
			optional: true,
			parse: String,
		},
	},
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "create",
	describe: "Create a Mesh node",
	usage: "$0 mesh nodes create\n\nCreates a new Mesh node in an account.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;
