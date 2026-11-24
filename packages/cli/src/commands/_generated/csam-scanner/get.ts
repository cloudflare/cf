/**
 * get command
 * @generated from apis/overlays/csam-scanner.ts
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
	describe: "Get CSAM Scanner setting",
	usage:
		"$0 csam-scanner get\n\nRetrieve the current CSAM Scanner configuration for a zone. The notification email is masked by default in responses.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
