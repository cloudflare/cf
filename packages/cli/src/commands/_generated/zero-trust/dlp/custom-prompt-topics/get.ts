/**
 * get command
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
	},
	operands: [{ placeholder: "entry-id", brief: "Entry ID", parse: String }],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <entry-id>",
	describe: "Get custom prompt topic",
	usage:
		"$0 zero-trust dlp custom-prompt-topics get <entry-id>\n\nFetches a DLP custom prompt topic entry by ID.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
