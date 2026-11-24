/**
 * delete command
 * @generated from apis/overlays/dls.ts
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
			placeholder: "binding-id",
			brief: "Unique identifier for the prefix binding.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "delete <binding-id>",
	describe: "Delete a DLS prefix binding",
	usage:
		"$0 dls regional-services prefix-bindings delete <binding-id>\n\nDelete a BYOIP prefix binding. Like creating a binding, this requires **IP Prefixes Write** in addition to **DLS Write**.",
	...parameters,
	loader: () => import("./delete.handler.js"),
});

export default command;
