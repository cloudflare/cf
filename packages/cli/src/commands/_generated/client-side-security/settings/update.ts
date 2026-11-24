/**
 * update command
 * @generated from apis/overlays/client-side-security.ts
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
			brief: "When true, indicates that Client-Side Security is enabled.",
			optional: true,
		},
		"use-cloudflare-reporting-endpoint": {
			kind: "boolean",
			brief:
				"When true, CSP reports will be sent to https://csp-reporting.cloudflare.com/cdn-cgi/script_monitor/report",
			optional: true,
		},
		"use-connection-url-path": {
			kind: "boolean",
			brief:
				"When true, the paths associated with connections URLs will also be analyzed.",
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
	describe: "Update client-side security settings",
	usage:
		"$0 client-side-security settings update\n\nUpdates client-side security enablement and reporting behaviors for the zone.",
	...parameters,
	loader: () => import("./update.handler.js"),
});

export default command;
