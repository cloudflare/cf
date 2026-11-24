/**
 * delete command
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
		force: {
			kind: "boolean",
			brief: "Skip confirmation (useful in scripts and CI)",
			alias: "f",
			default: false,
		},
	},
	operands: [
		{
			placeholder: "node-id",
			brief: "ID of the node to delete",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "delete <node-id>",
	describe: "Delete a tenant node",
	usage:
		"$0 zero-trust cws tenant-structures nodes delete <node-id>\n\nDeletes a childless node from the tenant hierarchy.",
	...parameters,
	loader: () => import("./delete.handler.js"),
});

export default command;
