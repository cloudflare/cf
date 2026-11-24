/**
 * get command
 * @generated from apis/overlays/zaraz.ts
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
	describe: "Get default Zaraz configuration",
	usage: "$0 zaraz default get\n\nGets default Zaraz configuration for a zone.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
