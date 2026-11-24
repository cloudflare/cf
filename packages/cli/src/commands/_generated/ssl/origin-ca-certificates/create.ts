/**
 * create command
 * @generated from apis/overlays/ssl.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";
import { resolveFileToken } from "#lib/input-validation.js";

const parameters = {
	flags: {
		csr: {
			kind: "parsed",
			brief: "The Certificate Signing Request (CSR). Must be newline-encoded.",
			optional: true,
			parse: String,
		},
		hostnames: {
			kind: "parsed",
			brief:
				"Array of hostnames or wildcard names bound to the certificate.\nHostnames must be fully qualified domain names (FQDNs) belonging to zones on your account (e.g., `example.com` or `sub.example.com`). Wildcards are supported only as a `*.` prefix for a single level (e.g., `*.example.com`). Double wildcards (`*.*.example.com`) and interior wildcards (`foo.*.example.com`) are not allowed. The wildcard suffix must be a multi-label domain (`*.example.com` is valid, but `*.com` is not). Unicode/IDN hostnames are accepted and automatically converted to punycode.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"request-type": {
			kind: "parsed",
			brief:
				'Signature type desired on certificate ("origin-rsa" (rsa), "origin-ecc" (ecdsa), or "keyless-certificate" (for Keyless SSL servers).',
			optional: true,
			choices: ["origin-rsa", "origin-ecc", "keyless-certificate"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "request-type", "text"),
		},
		"requested-validity": {
			kind: "parsed",
			brief: "The number of days for which the certificate should be valid.",
			default: "5475",
			parse: Number,
		},
		"zone-id": {
			kind: "parsed",
			brief:
				"Identifier of the zone whose keyless servers the certificate is for. Required when `request_type` is `keyless-certificate`; ignored otherwise.",
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
			brief: "Raw JSON request body (bypasses individual flags)",
			optional: true,
			parse: String,
		},
	},
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "create",
	describe: "Create Certificate",
	usage:
		"$0 ssl origin-ca-certificates create\n\nCreate an Origin CA certificate. For `keyless-certificate` requests, `zone_id` is required and the response contains only `id`, `certificate`, and `expires_on`. You can use an Origin CA Key as your User Service Key or an API token when calling this endpoint ([see above](#requests)).",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;
