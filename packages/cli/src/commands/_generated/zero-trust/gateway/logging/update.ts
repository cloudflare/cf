/**
 * update command
 * @generated from apis/overlays/zero-trust.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"redact-pii": {
			kind: "boolean",
			brief:
				"Indicate whether to redact personally identifiable information from activity logging (PII fields include source IP, user email, user ID, device ID, URL, referrer, and user agent).",
			optional: true,
		},
		"settings-by-rule-type-dns-log-all": {
			kind: "boolean",
			brief: "Specify whether to log all requests to this service.",
			optional: true,
		},
		"settings-by-rule-type-dns-log-blocks": {
			kind: "boolean",
			brief: "Specify whether to log only blocking requests to this service.",
			optional: true,
		},
		"settings-by-rule-type-http-log-all": {
			kind: "boolean",
			brief: "Specify whether to log all requests to this service.",
			optional: true,
		},
		"settings-by-rule-type-http-log-blocks": {
			kind: "boolean",
			brief: "Specify whether to log only blocking requests to this service.",
			optional: true,
		},
		"settings-by-rule-type-l4-log-all": {
			kind: "boolean",
			brief: "Specify whether to log all requests to this service.",
			optional: true,
		},
		"settings-by-rule-type-l4-log-blocks": {
			kind: "boolean",
			brief: "Specify whether to log only blocking requests to this service.",
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
	command: "update",
	describe: "Update Zero Trust account logging settings",
	usage:
		"$0 zero-trust gateway logging update\n\nUpdate logging settings for the current Zero Trust account.",
	...parameters,
	loader: () => import("./update.handler.js"),
});

export default command;
