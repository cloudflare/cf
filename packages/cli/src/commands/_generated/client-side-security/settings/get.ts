/**
 * get command
 * @generated from apis/overlays/client-side-security.ts
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
	describe: "Get client-side security settings",
	usage:
		"$0 client-side-security settings get\n\nReturns the client-side security product enablement status and reporting behaviors.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
