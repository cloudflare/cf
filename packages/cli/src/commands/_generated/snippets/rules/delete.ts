/**
 * delete command
 * @generated from apis/overlays/snippets.ts
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
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "delete",
	describe: "Delete zone snippet rules",
	usage:
		"$0 snippets rules delete\n\nDeletes all snippet rules belonging to the zone.",
	...parameters,
	loader: () => import("./delete.handler.js"),
});

export default command;
