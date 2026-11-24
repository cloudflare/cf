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
			placeholder: "repo-connection-uuid",
			brief: "Repository connection UUID.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "delete <repo-connection-uuid>",
	describe: "Delete a repository connection",
	usage:
		"$0 builds repos connections delete <repo-connection-uuid>\n\nDelete a saved repository connection.",
	...parameters,
	loader: () => import("./delete.handler.js"),
});

export default command;
