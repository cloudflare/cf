/**
 * edit command
 * @generated from apis/overlays/monetization.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";
import { resolveFileToken } from "#lib/input-validation.js";

const parameters = {
	flags: {
		address: {
			kind: "parsed",
			brief:
				"0x-prefixed 20-byte hexadecimal Ethereum address. Mixed-case addresses must carry a valid EIP-55 checksum; all-lowercase or all-uppercase addresses are also accepted. The effective address must pass wallet screening whenever the rule is patched.",
			optional: true,
			parse: String,
		},
		description: {
			kind: "parsed",
			brief: "The description field",
			optional: true,
			parse: String,
		},
		enabled: { kind: "boolean", brief: "The enabled field", optional: true },
		expression: {
			kind: "parsed",
			brief:
				"Wirefilter expression identifying the requests that require payment. Forwarded verbatim to the Rulesets API, which validates its syntax.",
			optional: true,
			parse: String,
		},
		price: {
			kind: "parsed",
			brief:
				'Price in the smallest indivisible unit of the configured payment token, encoded as a decimal string. Must be a canonical decimal integer in [1000, 100000000]: no leading zeros, and a bare JSON number is rejected. The price is required for the fixed-price schemes ("exact" and "upto") and must be at least 1000, the smallest amount the payment facilitator can settle ($0.001 for a 6-decimal token such as USDC), and at most 100000000 ($100 for a 6-decimal token). When the scheme is "origin_controlled" the origin server sets pricing dynamically and the rule carries no price: the field must be omitted — any provided value, including "0", is rejected because it would not be enforced. Responses always encode this as a string and omit it for "origin_controlled" rules; the pattern matches exactly the set of values the server accepts.',
			optional: true,
			parse: String,
		},
		scheme: {
			kind: "parsed",
			brief:
				'X402 payment scheme. "exact" requires the specified payment amount; "upto" permits a payment up to the specified amount; "origin_controlled" lets the origin server set pricing dynamically, in which case the rule carries no price and the price field must be omitted.',
			optional: true,
			choices: ["exact", "upto", "origin_controlled"],
			parse: String,
			coerce: (value: string) => resolveFileToken(value, "scheme", "text"),
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		body: {
			kind: "parsed",
			brief:
				"Partial update to a single payment rule. Only the fields present are modified; omitted fields keep their existing values.",
			optional: true,
			parse: String,
		},
	},
	operands: [
		{
			placeholder: "rule-id",
			brief: "The unique ID of the payment rule.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "edit <rule-id>",
	describe: "Update a payment rule",
	usage:
		"$0 monetization rules edit <rule-id>\n\nApplies a partial update to a single Payment Required rule. Only the fields present in the request body are changed; omitted fields keep their current values. Returns the full resulting rule collection.",
	...parameters,
	loader: () => import("./edit.handler.js"),
});

export default command;
