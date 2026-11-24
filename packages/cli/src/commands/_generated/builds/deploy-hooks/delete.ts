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
		worker: {
			kind: "parsed",
			brief: "Name or script tag of the Worker.",
			parse: String,
		},
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
			placeholder: "deploy-hook-uuid",
			brief: "UUID of the deploy hook, as returned by deploy-hooks list.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "delete <deploy-hook-uuid>",
	describe: "Delete a deploy hook",
	usage:
		"$0 builds deploy-hooks delete <deploy-hook-uuid>\n\nDelete a deploy hook so its UUID can no longer start builds.",
	...parameters,
	loader: () => import("./delete.handler.js"),
});

export default command;
