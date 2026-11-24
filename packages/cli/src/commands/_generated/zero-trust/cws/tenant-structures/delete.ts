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
			placeholder: "structure-id",
			brief: "ID of the tenant structure to delete",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "delete <structure-id>",
	describe: "Delete a tenant structure",
	usage:
		"$0 zero-trust cws tenant-structures delete <structure-id>\n\nDeletes the tenant structure and all nodes in its hierarchy.",
	...parameters,
	loader: () => import("./delete.handler.js"),
});

export default command;
