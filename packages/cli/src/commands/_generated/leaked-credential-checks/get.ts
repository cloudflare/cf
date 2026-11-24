/**
 * get command
 * @generated from apis/overlays/leaked-credential-checks.ts
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
	describe: "Get the Leaked Credential Checks status for a zone.",
	usage:
		"$0 leaked-credential-checks get\n\nGet the current Leaked Credential Checks status for the zone. While enabled, Cloudflare scans incoming requests for usernames and passwords that were exposed in known data breaches.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
