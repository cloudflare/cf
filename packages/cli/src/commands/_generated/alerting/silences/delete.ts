/**
 * delete command
 * @generated from apis/overlays/alerting.ts
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
	operands: [{ placeholder: "silence-id", brief: "Silence ID", parse: String }],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "delete <silence-id>",
	describe: "Delete Silence",
	usage:
		"$0 alerting silences delete <silence-id>\n\nDeletes an existing silence for an account.",
	...parameters,
	loader: () => import("./delete.handler.js"),
});

export default command;
