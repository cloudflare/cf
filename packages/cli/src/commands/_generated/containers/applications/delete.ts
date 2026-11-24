/**
 * delete command
 * @generated from apis/overlays/containers.ts
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
			placeholder: "application-id",
			brief: "An Application ID represents an identifier of an application.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "delete <application-id>",
	describe: "Delete a single application by id",
	usage:
		"$0 containers applications delete <application-id>\n\nDeletes a single application by id.",
	...parameters,
	loader: () => import("./delete.handler.js"),
});

export default command;
