/**
 * delete-all command
 * @generated from apis/overlays/monetization.ts
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
	command: "delete-all",
	describe: "Delete all payment rules",
	usage:
		"$0 monetization rules delete-all\n\nRemoves every Payment Required rule from the zone. Any rules the service does not own are preserved. Deleting a zone with no payment rules is a no-op. Returns the resulting (empty) rule collection.",
	...parameters,
	loader: () => import("./delete-all.handler.js"),
});

export default command;
