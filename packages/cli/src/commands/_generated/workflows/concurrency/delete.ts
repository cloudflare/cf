/**
 * delete command
 * @generated from apis/overlays/workflows.ts
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
			placeholder: "key-id",
			brief: "Identifier of the concurrency key.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "delete <key-id>",
	describe: "Delete a concurrency key",
	usage:
		"$0 workflows concurrency delete <key-id>\n\nDeletes a concurrency key. Fails while any workflow’s latest version references the key. The key disappears immediately, but steps already holding it keep their slots until they finish and still count against a key re-created with the same name.",
	...parameters,
	loader: () => import("./delete.handler.js"),
});

export default command;
