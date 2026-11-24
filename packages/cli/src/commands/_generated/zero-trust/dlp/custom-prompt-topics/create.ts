/**
 * create command
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
		"profile-id": {
			kind: "parsed",
			brief: "The profile_id field",
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
			brief: "A new custom prompt topic to create.",
			optional: true,
			parse: String,
		},
	},
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "create",
	describe: "Create custom prompt topic",
	usage:
		"$0 zero-trust dlp custom-prompt-topics create\n\nCreates a DLP custom prompt topic entry.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;
