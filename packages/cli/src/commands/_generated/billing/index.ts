import $addresses from "./addresses/index.js";
import $profiles from "./profiles/index.js";
import $rateplans from "./rate-plans/index.js";
import $spendpolicies from "./spend-policies/index.js";
import $usage from "./usage/index.js";
/**
 * billing command
 * @generated from apis/overlays/billing.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "billing",
	describe:
		"Account billing profiles and usage data for Cloudflare subscriptions and add-on services",

	routes: {
		addresses: $addresses,
		profiles: $profiles,
		"rate-plans": $rateplans,
		"spend-policies": $spendpolicies,
		usage: $usage,
	},
});

export default command;
