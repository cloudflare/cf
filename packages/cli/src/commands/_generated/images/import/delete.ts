/**
 * delete command
 * @generated from apis/overlays/images.ts
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
			placeholder: "migration-id",
			brief: "Sourcing kit resource identifier.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "delete <migration-id>",
	describe: "Delete a sourcing kit migration",
	usage:
		"$0 images import delete <migration-id>\n\nDelete a completed, failed, or aborted CF Images import.",
	...parameters,
	loader: () => import("./delete.handler.js"),
});

export default command;
