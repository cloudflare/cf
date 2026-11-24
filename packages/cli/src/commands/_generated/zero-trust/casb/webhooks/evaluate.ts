/**
 * evaluate command
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
			brief: "Type of authentication to use for the test webhook request.",
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
			brief: "Target URL to send the test webhook event to.",
			optional: true,
			parse: String,
		},
		headers: {
			kind: "parsed",
			brief:
				'List of custom headers to include in the test webhook request. Provide as a JSON array of objects or @path/to/file.json. Shape: [{"key": string, "value"?: (string | null)}]. ? marks optional keys.',
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
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		body: {
			kind: "parsed",
			brief:
				"Request body for testing a webhook configuration before creating it.",
			optional: true,
			parse: String,
		},
	},
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "evaluate",
	describe: "Test a webhook configuration before creating it",
	usage:
		'$0 zero-trust casb webhooks evaluate\n\nSends a test webhook event to the specified destination URL to verify the webhook endpoint is reachable and properly configured. This allows customers to validate their webhook configuration before creating the actual webhook resource. The test payload includes: - event_type: "webhook.test" - timestamp: Current UTC timestamp - message: Test message indicating this is from Cloudflare CASB - data: Object with test: true',
	...parameters,
	loader: () => import("./evaluate.handler.js"),
});

export default command;
