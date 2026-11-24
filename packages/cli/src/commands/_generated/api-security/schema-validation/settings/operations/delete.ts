/**
 * delete command
 * @generated from apis/overlays/api-security.ts
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
			placeholder: "operation-id",
			brief: "Identifier for the operation",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "delete <operation-id>",
	describe: "Delete per-operation schema validation setting",
	usage:
		"$0 api-security schema-validation settings operations delete <operation-id>\n\nRemoves custom schema validation settings for a specific API operation, reverting to zone-level defaults.",
	...parameters,
	loader: () => import("./delete.handler.js"),
});

export default command;
