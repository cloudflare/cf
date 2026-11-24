/**
 * delete command
 * @generated from apis/overlays/builds.ts
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
			placeholder: "worker",
			brief: "Script tag of the Worker.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "delete <worker>",
	describe: "Delete Worker build configuration",
	usage:
		"$0 builds workers delete <worker>\n\nDelete build settings and triggers for a Worker tag and cancel unfinished builds. The Worker is not deleted.",
	...parameters,
	loader: () => import("./delete.handler.js"),
});

export default command;
