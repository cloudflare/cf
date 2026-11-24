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
			placeholder: "rego-module-id",
			brief: "ID of the Rego module to delete",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "delete <rego-module-id>",
	describe: "Delete a Rego module",
	usage:
		"$0 zero-trust cws rego-modules delete <rego-module-id>\n\nDeletes the module if no policy or library references its rules.",
	...parameters,
	loader: () => import("./delete.handler.js"),
});

export default command;
