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
			brief: "Attributes of the new validator.",
			optional: true,
			parse: String,
		},
	},
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "create",
	describe: "Create a worker validator",
	usage:
		"$0 zero-trust dlp validators worker create\n\nRegisters a customer Worker as a validator. An account may own at most 100 validators across all kinds.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;
