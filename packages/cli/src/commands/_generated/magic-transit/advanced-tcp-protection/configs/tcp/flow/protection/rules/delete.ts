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
			placeholder: "rule-id",
			brief: "The UUID of the TCP Flow Protection rule to delete.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "delete <rule-id>",
	describe: "Delete TCP Flow Protection rule.",
	usage:
		"$0 magic-transit advanced-tcp-protection configs tcp flow protection rules delete <rule-id>\n\nDelete a TCP Flow Protection rule specified by the given UUID.",
	...parameters,
	loader: () => import("./delete.handler.js"),
});

export default command;
