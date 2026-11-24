/**
 * delete command
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
		force: {
			kind: "boolean",
			brief: "Skip confirmation (useful in scripts and CI)",
			alias: "f",
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
	command: "delete <live-input-identifier>",
	describe: "Delete a live input",
	usage:
		"$0 stream live-inputs delete <live-input-identifier>\n\nPermanently delete a live input, making it inaccessible and blocking current and future broadcasts to it. Existing recordings will be retained.",
	...parameters,
	loader: () => import("./delete.handler.js"),
});

export default command;
