/**
 * delete command
 * @generated from apis/overlays/content-scan.ts
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
			placeholder: "expression-id",
			brief:
				"Defines the unique ID for this Content Scanning custom expression.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "delete <expression-id>",
	describe: "Delete a Content Scanning custom expression from a zone.",
	usage:
		"$0 content-scan expressions delete <expression-id>\n\nDelete the Content Scanning custom expression with the given identifier and return the expressions that remain. Content objects reached only by the deleted expression are no longer scanned.",
	...parameters,
	loader: () => import("./delete.handler.js"),
});

export default command;
