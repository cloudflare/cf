/**
 * edit command
 * @generated from apis/overlays/firewall.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";
import { resolveFileToken } from "#lib/input-validation.js";

const parameters = {
	flags: {
		"configuration-target": {
			kind: "parsed",
			brief:
				"Variant descriptions:\n- `ip`: The configuration target. You must set the target to `ip` when specifying an IP address in the rule.\n- `ip6`: The configuration target. You must set the target to `ip6` when specifying an IPv6 address in the rule.\n- `ip_range`: The configuration target. You must set the target to `ip_range` when specifying an IP address range in the rule.\n- `asn`: The configuration target. You must set the target to `asn` when specifying an Autonomous System Number (ASN) in the rule.\n- `country`: The configuration target. You must set the target to `country` when specifying a country code in the rule.",
			optional: true,
			choices: ["ip", "ip6", "ip_range", "asn", "country"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "configuration-target", "text"),
		},
		"configuration-value": {
			kind: "parsed",
			brief:
				"Variant descriptions:\n- The IP address to match. This address will be compared to the IP address of incoming requests.\n- The IPv6 address to match.\n- The IP address range to match. You can only use prefix lengths `/16` and `/24` for IPv4 ranges, and prefix lengths `/32`, `/48`, and `/64` for IPv6 ranges.\n- The AS number to match.\n- The two-letter ISO-3166-1 alpha-2 code to match. For more information, refer to [IP Access rules: Parameters](https://developers.cloudflare.com/waf/tools/ip-access-rules/parameters/#country).",
			optional: true,
			parse: String,
		},
		"access-rule-mode": {
			kind: "parsed",
			brief: "The action to apply to a matched request.",
			optional: true,
			choices: [
				"block",
				"challenge",
				"whitelist",
				"js_challenge",
				"managed_challenge",
			],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "access-rule-mode", "text"),
		},
		notes: {
			kind: "parsed",
			brief:
				"An informative summary of the rule, typically used as a reminder or explanation.",
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
	operands: [
		{
			placeholder: "rule-id",
			brief: "Unique identifier for a rule.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "edit <rule-id>",
	describe: "Update an IP Access rule",
	usage:
		"$0 firewall access-rules edit <rule-id>\n\nUpdates an IP Access rule defined. Note: This operation will affect all zones in the account or zone.\n\nRuns against your account. Pass --zone to run against a zone instead. CLOUDFLARE_ZONE_ID is ignored.",
	...parameters,
	loader: () => import("./edit.handler.js"),
});

export default command;
