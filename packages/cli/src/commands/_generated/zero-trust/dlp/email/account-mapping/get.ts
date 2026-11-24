/**
 * get command
 * @generated from apis/overlays/zero-trust.ts
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
	describe: "Get mapping",
	usage:
		"$0 zero-trust dlp email account-mapping get\n\nRetrieves the email provider mapping configuration for DLP email scanning.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
