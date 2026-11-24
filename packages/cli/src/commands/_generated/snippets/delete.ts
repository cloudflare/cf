/**
 * delete command
 * @generated from apis/overlays/snippets.ts
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
			placeholder: "snippet-name",
			brief: "Identify the snippet.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "delete <snippet-name>",
	describe: "Delete a zone snippet",
	usage:
		"$0 snippets delete <snippet-name>\n\nDeletes a snippet belonging to the zone. Returns a 4XX response if the zone or snippet no longer exists.",
	...parameters,
	loader: () => import("./delete.handler.js"),
});

export default command;
