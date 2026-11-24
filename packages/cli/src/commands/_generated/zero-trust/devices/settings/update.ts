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
		"disable-for-time": {
			kind: "parsed",
			brief:
				"Sets the time limit, in seconds, that a user can use an override code to bypass WARP.",
			optional: true,
			parse: Number,
		},
		"external-emergency-signal-enabled": {
			kind: "boolean",
			brief:
				"Controls whether the external emergency disconnect feature is enabled.",
			optional: true,
		},
		"external-emergency-signal-fingerprint": {
			kind: "parsed",
			brief:
				"The SHA256 fingerprint (64 hexadecimal characters) of the HTTPS server certificate for the external_emergency_signal_url. If provided, the WARP client will use this value to verify the server's identity. The device will ignore any response if the server's certificate fingerprint does not exactly match this value.",
			optional: true,
			parse: String,
		},
		"external-emergency-signal-interval": {
			kind: "parsed",
			brief:
				'The interval at which the WARP client fetches the emergency disconnect signal, formatted as a duration string (e.g., "5m", "2m30s", "1h"). Minimum 30 seconds.',
			optional: true,
			parse: String,
		},
		"external-emergency-signal-url": {
			kind: "parsed",
			brief:
				"The HTTPS URL from which to fetch the emergency disconnect signal. Must use HTTPS and have an IPv4 or IPv6 address as the host.",
			optional: true,
			parse: String,
		},
		"gateway-proxy-enabled": {
			kind: "boolean",
			brief: "Enable gateway proxy filtering on TCP.",
			optional: true,
		},
		"gateway-udp-proxy-enabled": {
			kind: "boolean",
			brief: "Enable gateway proxy filtering on UDP.",
			optional: true,
		},
		"root-certificate-installation-enabled": {
			kind: "boolean",
			brief: "Enable installation of cloudflare managed root certificate.",
			optional: true,
		},
		"use-zt-virtual-ip": {
			kind: "boolean",
			brief: "Enable using CGNAT virtual IPv4.",
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
	describe: "Update device settings",
	usage:
		"$0 zero-trust devices settings update\n\nUpdates the device settings for a Zero Trust account.",
	...parameters,
	loader: () => import("./update.handler.js"),
});

export default command;
