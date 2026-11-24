/**
 * purge-cache command
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
	command: "purge-cache <worker>",
	describe: "Purge a Worker's build cache",
	usage:
		"$0 builds workers purge-cache <worker>\n\nDelete cached dependencies and build artifacts for a Worker's production and Preview builds.",
	...parameters,
	loader: () => import("./purge-cache.handler.js"),
});

export default command;
