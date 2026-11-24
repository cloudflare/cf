/**
 * update command
 * @generated from apis/overlays/google-tag-gateway.ts
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
			brief: "Enables or disables Google Tag Gateway for this zone.",
			optional: true,
		},
		endpoint: {
			kind: "parsed",
			brief:
				"Specifies the endpoint path for proxying Google Tag Manager requests. Use an absolute path starting with '/', with no nested paths and alphanumeric characters only (e.g. /metrics).",
			optional: true,
			parse: String,
		},
		"hide-original-ip": {
			kind: "boolean",
			brief:
				"Deprecated. This value is stored but has no effect on traffic. Optional in requests: if omitted, the previously stored value is kept. Responses always include it.",
			optional: true,
		},
		"measurement-id": {
			kind: "parsed",
			brief:
				"Specify the Google Tag Manager container or measurement ID (e.g. GTM-XXXXXXX or G-XXXXXXXXXX).",
			optional: true,
			parse: String,
		},
		"set-up-tag": {
			kind: "boolean",
			brief:
				"Set up the associated Google Tag on the zone automatically when enabled.",
			optional: true,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		body: {
			kind: "parsed",
			brief: "Google Tag Gateway configuration for a zone.",
			optional: true,
			parse: String,
		},
	},
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "update",
	describe: "Update Google Tag Gateway configuration",
	usage:
		"$0 google-tag-gateway config update\n\nUpdates the Google Tag Gateway configuration for a zone.",
	...parameters,
	loader: () => import("./update.handler.js"),
});

export default command;
