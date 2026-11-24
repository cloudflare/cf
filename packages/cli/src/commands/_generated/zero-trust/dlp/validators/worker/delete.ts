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
		{ placeholder: "validator-id", brief: "Validator ID", parse: String },
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "delete <validator-id>",
	describe: "Delete a worker validator",
	usage:
		"$0 zero-trust dlp validators worker delete <validator-id>\n\nDeletes a `worker` validator. Fails with `409` while any detection entry is still attached to it; detach it from those entries first.",
	...parameters,
	loader: () => import("./delete.handler.js"),
});

export default command;
