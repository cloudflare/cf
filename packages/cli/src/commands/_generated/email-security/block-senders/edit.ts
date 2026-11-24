/**
 * edit command
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
				"Timestamp at which the pattern expires. After this time, Email Security ignores the pattern. The value must lie in the future. Send `null` to clear the expiration.",
			optional: true,
			parse: String,
		},
		"is-regex": {
			kind: "boolean",
			brief:
				"Whether `pattern` is a regular expression instead of a literal value.",
			optional: true,
		},
		pattern: {
			kind: "parsed",
			brief:
				"The pattern value to match. The format depends on `pattern_type`: a valid email address for EMAIL (e.g. `user@example.com`), a valid domain name for DOMAIN (e.g. `example.com`), or a plain IPv4 or IPv6 address or CIDR block for IP (e.g. `1.2.3.4`, `1.2.3.0/24`, `2606:4700:4700::1111`, or `2606:4700:4700::/48`); the API rejects private or unique-local, loopback, link-local, unspecified, and IPv4 broadcast addresses, including their IPv4-mapped IPv6 equivalents.",
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
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		body: {
			kind: "parsed",
			brief: "Update a blocked sender pattern.",
			optional: true,
			parse: String,
		},
	},
	operands: [
		{
			placeholder: "pattern-id",
			brief: "Blocked sender pattern identifier.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "edit <pattern-id>",
	describe: "Update a blocked email sender",
	usage:
		"$0 email-security block-senders edit <pattern-id>\n\nUpdates an existing blocked sender pattern. Only provided fields will be modified. The pattern will continue blocking emails until deleted.",
	...parameters,
	loader: () => import("./edit.handler.js"),
});

export default command;
