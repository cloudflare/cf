/**
 * list command
 * @generated from apis/overlays/mesh.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"node-id": { kind: "parsed", brief: "UUID of the tunnel.", parse: String },
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "list",
	describe: "List Mesh node connections",
	usage:
		"$0 mesh nodes connections list\n\nLists connection details for a Mesh node.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
