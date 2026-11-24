/**
 * get command
 * @generated from apis/overlays/logs.ts
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
	command: "get",
	describe: "List fields",
	usage:
		"$0 logs received fields get\n\nLists all fields available. The response is json object with key-value pairs, where keys are field names, and values are descriptions.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
