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
		default: {
			kind: "parsed",
			brief:
				"The default field. Accepts a JSON scalar or plain string, or @path/to/file.",
			optional: true,
			parse: String,
		},
		name: {
			kind: "parsed",
			brief: "A name for this validator, at most 50 characters.",
			optional: true,
			parse: String,
		},
		"script-tag": {
			kind: "parsed",
			brief:
				"The public script tag of the customer's Worker that scores matches.",
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
			brief: "Attributes of the validator to update.",
			optional: true,
			parse: String,
		},
	},
	operands: [
		{ placeholder: "validator-id", brief: "Validator ID", parse: String },
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "update <validator-id>",
	describe: "Update a worker validator",
	usage:
		"$0 zero-trust dlp validators worker update <validator-id>\n\nReplaces the name, script tag and fallback verdict of a `worker` validator. Attachments to detection entries are owned from the entry side and are not affected.",
	...parameters,
	loader: () => import("./update.handler.js"),
});

export default command;
