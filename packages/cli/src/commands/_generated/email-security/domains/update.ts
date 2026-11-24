/**
 * update command
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
		"allowed-delivery-modes": {
			kind: "parsed",
			brief: "Delivery modes to onboard the domain through.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"drop-dispositions": {
			kind: "parsed",
			brief:
				'Dispositions to drop instead of delivering, e.g. `["MALICIOUS", "SPAM"]`.',
			variadic: true,
			optional: true,
			parse: String,
		},
		folder: {
			kind: "parsed",
			brief: "The mailbox folder to scan, for API-scanning domains.",
			optional: true,
			choices: ["AllItems", "Inbox"],
			parse: String,
			coerce: (value: string) => resolveFileToken(value, "folder", "text"),
		},
		"integration-id": {
			kind: "parsed",
			brief:
				"Identifier of the CASB integration that authorizes this domain. The integration also enables API scanning, post-delivery actions, and directory sync.",
			optional: true,
			parse: String,
		},
		"ip-restrictions": {
			kind: "parsed",
			brief:
				"Source IP ranges mail is accepted from. Any other source is rejected.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"lookback-hops": {
			kind: "parsed",
			brief:
				"Number of hops to trace back through received headers when reconstructing the original message (1-20).",
			optional: true,
			parse: Number,
		},
		regions: {
			kind: "parsed",
			brief:
				'Regions that process messages for this domain, e.g. `["GLOBAL"]` or `["US"]`.',
			variadic: true,
			optional: true,
			parse: String,
		},
		"require-tls-inbound": {
			kind: "boolean",
			brief: "Require TLS on inbound connections.",
			optional: true,
		},
		"require-tls-outbound": {
			kind: "boolean",
			brief: "Require TLS on outbound connections.",
			optional: true,
		},
		transport: {
			kind: "parsed",
			brief:
				"The mail transport hostname for MX/Inline delivery — the MX record Cloudflare delivers email to (e.g. `mx.example.com`).",
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
				"Request body for replacing an email domain. The `domain` field is intentionally absent — the domain name is immutable after creation. ",
			optional: true,
			parse: String,
		},
	},
	operands: [
		{ placeholder: "domain-id", brief: "Domain identifier.", parse: String },
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "update <domain-id>",
	describe: "Replace an email domain",
	usage:
		"$0 email-security domains update <domain-id>\n\nReplaces all mutable fields of a protected email domain in a single atomic operation. Unlike PATCH, all non-computed fields are required.",
	...parameters,
	loader: () => import("./update.handler.js"),
});

export default command;
