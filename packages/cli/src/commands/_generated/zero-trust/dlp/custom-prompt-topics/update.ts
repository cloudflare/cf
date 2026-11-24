/**
 * update command
 * @generated from apis/overlays/zero-trust.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		description: {
			kind: "parsed",
			brief: "The description field",
			optional: true,
			parse: String,
		},
		enabled: { kind: "boolean", brief: "The enabled field", optional: true },
		name: {
			kind: "parsed",
			brief: "The name field",
			optional: true,
			parse: String,
		},
		topic: {
			kind: "parsed",
			brief: "The topic field",
			optional: true,
			parse: String,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		body: {
			kind: "parsed",
			brief: "Update to be applied to the custom prompt topic.",
			optional: true,
			parse: String,
		},
	},
	operands: [{ placeholder: "entry-id", brief: "Entry ID", parse: String }],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "update <entry-id>",
	describe: "Update custom prompt topic",
	usage:
		"$0 zero-trust dlp custom-prompt-topics update <entry-id>\n\nUpdates a DLP custom prompt topic entry.",
	...parameters,
	loader: () => import("./update.handler.js"),
});

export default command;
