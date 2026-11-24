/**
 * get command
 * @generated from apis/overlays/smart-shield.ts
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
	describe: "Get Smart Shield Settings",
	usage: "$0 smart-shield get\n\nRetrieve Smart Shield Settings.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
