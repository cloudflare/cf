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
			placeholder: "prefix-id",
			brief: "The UUID of the prefix to delete.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "delete <prefix-id>",
	describe: "Delete prefix.",
	usage:
		"$0 magic-transit advanced-tcp-protection configs prefixes delete <prefix-id>\n\nDelete the prefix for an account given a UUID.",
	...parameters,
	loader: () => import("./delete.handler.js"),
});

export default command;
