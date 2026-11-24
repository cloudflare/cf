/**
 * get command
 * @generated from apis/overlays/security-txt.ts
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
	describe: "Retrieves security.txt",
	usage:
		"$0 security-txt get\n\nRetrieves the current security.txt file configuration for a zone, used for security vulnerability reporting.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
