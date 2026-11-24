/**
 * update command
 * @generated from apis/overlays/leaked-credential-checks.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		enabled: {
			kind: "boolean",
			brief: "Determines whether or not Leaked Credential Checks are enabled.",
			optional: true,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		force: {
			kind: "boolean",
			brief: "Skip confirmation (useful in scripts and CI)",
			alias: "f",
			default: false,
		},
		body: {
			kind: "parsed",
			brief: "Defines the overall status for Leaked Credential Checks.",
			optional: true,
			parse: String,
		},
	},
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "update",
	describe: "Update the Leaked Credential Checks status for a zone.",
	usage:
		"$0 leaked-credential-checks update\n\nUpdate the Leaked Credential Checks status for the zone, enabling or disabling the detection. While enabled, the detection populates the `cf.waf.credential_check.*` fields, which you can reference in custom rules and rate limiting rules to challenge or block requests carrying compromised credentials.",
	...parameters,
	loader: () => import("./update.handler.js"),
});

export default command;
