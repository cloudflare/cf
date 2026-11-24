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
		{ placeholder: "redundancy-group-id", brief: "Identifier", parse: String },
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "delete <redundancy-group-id>",
	describe: "Delete a Redundancy Group",
	usage:
		"$0 magic-transit redundancy-groups delete <redundancy-group-id>\n\nDeletes a redundancy group. Member tunnels are not deleted — their redundancy_group_id is cleared.",
	...parameters,
	loader: () => import("./delete.handler.js"),
});

export default command;
