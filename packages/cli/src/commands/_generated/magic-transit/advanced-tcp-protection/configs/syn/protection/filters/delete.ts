/**
 * delete command
 * @generated from apis/overlays/magic-transit.ts
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
			placeholder: "filter-id",
			brief: "The UUID of the filter to delete.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "delete <filter-id>",
	describe: "Delete SYN Protection filter.",
	usage:
		"$0 magic-transit advanced-tcp-protection configs syn protection filters delete <filter-id>\n\nDelete a SYN Protection filter specified by the given UUID.",
	...parameters,
	loader: () => import("./delete.handler.js"),
});

export default command;
