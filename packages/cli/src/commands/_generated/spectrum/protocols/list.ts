/**
 * list command
 * @generated from apis/overlays/spectrum.ts
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
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "list",
	describe: "List Spectrum application protocols",
	usage:
		"$0 spectrum protocols list\n\nRetrieves a list of Spectrum application protocols available for a zone.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
