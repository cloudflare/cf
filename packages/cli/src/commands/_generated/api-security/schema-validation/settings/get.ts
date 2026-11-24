/**
 * get command
 * @generated from apis/overlays/api-security.ts
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
	describe: "Get global schema validation settings",
	usage:
		"$0 api-security schema-validation settings get\n\nRetrieves the current global schema validation settings for a zone.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
