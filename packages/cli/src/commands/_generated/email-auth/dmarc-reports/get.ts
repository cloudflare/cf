/**
 * get command
 * @generated from apis/overlays/email-auth.ts
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
	describe: "Get DMARC Report Status",
	usage:
		"$0 email-auth dmarc-reports get\n\nRetrieves the current DMARC report configuration and status for a zone. Returns the RUA prefix, enabled status, approved sources, and DNS records.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
