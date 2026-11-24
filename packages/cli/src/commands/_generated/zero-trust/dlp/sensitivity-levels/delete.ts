/**
 * delete command
 * @generated from apis/overlays/zero-trust.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"sensitivity-group-id": {
			kind: "parsed",
			brief: "Sensitivity group ID",
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
			placeholder: "sensitivity-level-id",
			brief: "Sensitivity level ID",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "delete <sensitivity-level-id>",
	describe: "Delete a single sensitivity level.",
	usage:
		"$0 zero-trust dlp sensitivity-levels delete <sensitivity-level-id>\n\nDeletes a sensitivity level from a group.",
	...parameters,
	loader: () => import("./delete.handler.js"),
});

export default command;
