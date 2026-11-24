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
		"include-counts": {
			kind: "boolean",
			brief:
				"Includes the total number of videos associated with the submitted query parameters.",
			optional: true,
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
	describe: "List live inputs",
	usage:
		"$0 stream live-inputs list\n\nLists the live inputs created for an account. To get the credentials needed to stream to a specific live input, request a single live input.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
