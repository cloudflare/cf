/**
 * create command
 * @generated from apis/overlays/zero-trust.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";
import { resolveFileToken } from "#lib/input-validation.js";

const parameters = {
	flags: {
		"authentication-type": {
			kind: "parsed",
			brief: "Type of authentication used for the webhook.",
			optional: true,
			choices: [
				"Basic Auth",
				"None",
				"Bearer Auth",
				"Static Headers",
				"HMAC-Signing",
			],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "authentication-type", "text"),
		},
		"destination-url": {
			kind: "parsed",
			brief:
				"Target URL for the webhook configuration. Where resulting data will be sent.",
			optional: true,
			parse: String,
		},
		headers: {
			kind: "parsed",
			brief:
				'List of custom headers to include in webhook requests. Provide as a JSON array of objects or @path/to/file.json. Shape: [{"key": string, "value"?: (string | null)}]. ? marks optional keys.',
			optional: true,
			parse: String,
		},
		label: {
			kind: "parsed",
			brief: "Account-specified display label for the webhook configuration.",
			optional: true,
			parse: String,
		},
		"signing-secret": {
			kind: "parsed",
			brief:
				'Secret key used for HMAC signing when authentication_type is "HMAC-Signing".',
			optional: true,
			parse: String,
		},
		status: {
			kind: "parsed",
			brief:
				"Status of the webhook configuration. Defaults to enabled when omitted.",
			default: "enabled",
			choices: ["enabled", "disabled"],
			parse: String,
			coerce: (value: string) => resolveFileToken(value, "status", "text"),
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		body: {
			kind: "parsed",
			brief: "Request body for creating a new webhook configuration.",
			optional: true,
			parse: String,
		},
	},
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "create",
	describe: "Create a new webhook configuration",
	usage:
		"$0 zero-trust casb webhooks create\n\nCreates a new webhook configuration for sending finding notifications to external endpoints.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;
