/**
 * enable command
 * @generated from apis/overlays/stream.ts
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
	operands: [
		{
			placeholder: "live-input-identifier",
			brief: "A unique identifier for a live input.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "enable <live-input-identifier>",
	describe: "Enable a live input",
	usage:
		"$0 stream live-inputs enable <live-input-identifier>\n\nAllows a disabled live input to start receiving broadcasts again.",
	...parameters,
	loader: () => import("./enable.handler.js"),
});

export default command;
