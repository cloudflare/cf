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
	operands: [{ placeholder: "entry-id", brief: "Entry ID", parse: String }],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "delete <entry-id>",
	describe: "Delete custom prompt topic",
	usage:
		"$0 zero-trust dlp custom-prompt-topics delete <entry-id>\n\nDeletes a DLP custom prompt topic entry.",
	...parameters,
	loader: () => import("./delete.handler.js"),
});

export default command;
