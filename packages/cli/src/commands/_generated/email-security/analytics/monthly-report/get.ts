/**
 * get command
 * @generated from apis/overlays/email-security.ts
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
	describe: "Get monthly report",
	usage:
		"$0 email-security analytics monthly-report get\n\nReturns an aggregated monthly email security report including detections, dispositions, and policy activity for the trailing 12 months.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
