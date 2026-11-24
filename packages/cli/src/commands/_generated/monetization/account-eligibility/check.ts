/**
 * check command
 * @generated from apis/overlays/monetization.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"accepted-terms-of-service": {
			kind: "boolean",
			brief:
				"Confirms acceptance of the Monetization Gateway terms of service.",
			optional: true,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		body: {
			kind: "parsed",
			brief: "Raw JSON request body (bypasses individual flags)",
			optional: true,
			parse: String,
		},
	},
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "check",
	describe: "Check account or zone monetization eligibility",
	usage:
		"$0 monetization account-eligibility check\n\nChecks the account or zone for Monetization Gateway eligibility and returns its pending, approved, or rejected decision.\n\nRuns against your account. Pass --zone to run against a zone instead. CLOUDFLARE_ZONE_ID is ignored.",
	...parameters,
	loader: () => import("./check.handler.js"),
});

export default command;
