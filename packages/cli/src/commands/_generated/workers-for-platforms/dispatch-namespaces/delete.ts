/**
 * delete command
 * @generated from apis/overlays/workers-for-platforms.ts
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
			placeholder: "dispatch-namespace",
			brief: "Name of the Workers for Platforms dispatch namespace.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "delete <dispatch-namespace>",
	describe: "Delete Workers for Platforms Dispatch Namespace",
	usage:
		"$0 workers-for-platforms dispatch-namespaces delete <dispatch-namespace>\n\nDelete a Workers for Platforms dispatch namespace.",
	...parameters,
	loader: () => import("./delete.handler.js"),
});

export default command;
