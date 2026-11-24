/**
 * list command
 * @generated from apis/overlays/stream.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"live-input-identifier": {
			kind: "parsed",
			brief: "A unique identifier for a live input.",
			parse: String,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "list",
	describe: "List all outputs associated with a specified live input",
	usage:
		"$0 stream live-inputs outputs list\n\nRetrieves all outputs associated with a specified live input.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
