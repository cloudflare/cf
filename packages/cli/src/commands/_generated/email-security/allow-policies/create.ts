/**
 * create command
 * @generated from apis/overlays/email-security.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";
import { resolveFileToken } from "#lib/input-validation.js";

const parameters = {
	flags: {
		comments: {
			kind: "parsed",
			brief: "The comments field",
			optional: true,
			parse: String,
		},
		"expires-at": {
			kind: "parsed",
			brief:
				"Timestamp at which the policy expires. After this time, Email Security ignores the policy. The value must lie in the future. Send `null` to clear the expiration.",
			optional: true,
			parse: String,
		},
		"is-acceptable-sender": {
			kind: "boolean",
			brief:
				"Exempts messages from this sender from Spam, Spoof and Bulk dispositions only; Malicious and Suspicious dispositions still apply.",
			optional: true,
		},
		"is-exempt-recipient": {
			kind: "boolean",
			brief: "Bypasses all detections for messages to this recipient.",
			optional: true,
		},
		"is-recipient": {
			kind: "boolean",
			brief:
				"Deprecated as of July 1, 2025. Use `is_exempt_recipient` instead. End of life: July 1, 2026.",
			optional: true,
		},
		"is-regex": {
			kind: "boolean",
			brief: "The is_regex field",
			optional: true,
		},
		"is-sender": {
			kind: "boolean",
			brief:
				"Deprecated as of July 1, 2025. Use `is_trusted_sender` instead. End of life: July 1, 2026.",
			optional: true,
		},
		"is-spoof": {
			kind: "boolean",
			brief:
				"Deprecated as of July 1, 2025. Use `is_acceptable_sender` instead. End of life: July 1, 2026.",
			optional: true,
		},
		"is-trusted-sender": {
			kind: "boolean",
			brief:
				"Bypasses all detections and link following for messages from this sender.",
			optional: true,
		},
		pattern: {
			kind: "parsed",
			brief:
				"The pattern value to match. The format depends on `pattern_type`: a valid email address for EMAIL (e.g. `user@example.com`), a valid domain name for DOMAIN (e.g. `example.com`), or a plain IPv4 or IPv6 address or CIDR block for IP (e.g. `1.2.3.4`, `1.2.3.0/24`, `2606:4700:4700::1111`, or `2606:4700:4700::/48`); the API rejects private or unique-local, loopback, link-local, unspecified, and IPv4 broadcast addresses, including their IPv4-mapped IPv6 equivalents. The API also rejects a pattern that equals a domain onboarded to the account, ignoring case.",
			optional: true,
			parse: String,
		},
		"pattern-type": {
			kind: "parsed",
			brief:
				"Type of pattern matching.\n- EMAIL: matches a full email address (e.g. `user@example.com`)\n- DOMAIN: matches a domain name (e.g. `example.com`)\n- IP: matches a plain IPv4 or IPv6 address (e.g. `1.2.3.4` or `2606:4700:4700::1111`) or CIDR block (e.g. `1.2.3.0/24` or `2606:4700:4700::/48`). The API rejects private or unique-local, loopback, link-local, unspecified, and IPv4 broadcast addresses, including their IPv4-mapped IPv6 equivalents.\n- UNKNOWN: deprecated; you cannot use this when creating or updating policies, but it may appear on existing entries.\n",
			optional: true,
			choices: ["EMAIL", "DOMAIN", "IP", "UNKNOWN"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "pattern-type", "text"),
		},
		"verify-sender": {
			kind: "boolean",
			brief:
				"Enforce DMARC, SPF or DKIM authentication. When on, Email Security only honors policies that pass authentication.",
			optional: true,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		body: {
			kind: "parsed",
			brief: "Create an allow policy.",
			optional: true,
			parse: String,
		},
	},
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "create",
	describe: "Create email allow policy",
	usage:
		"$0 email-security allow-policies create\n\nCreates a new allow policy that exempts matching emails from security detections. Use with caution as this bypasses email security scanning. Policies can match on sender patterns and apply to specific detections or all detections.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;
