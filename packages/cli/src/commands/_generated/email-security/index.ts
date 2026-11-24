import $allowpolicies from "./allow-policies/index.js";
import $analytics from "./analytics/index.js";
import $blocksenders from "./block-senders/index.js";
import $bulkactions from "./bulk-actions/index.js";
import $contentpolicies from "./content-policies/index.js";
import $domains from "./domains/index.js";
import $impersonationregistry from "./impersonation-registry/index.js";
import $investigate from "./investigate/index.js";
import $phishguard from "./phishguard/index.js";
import $sendingdomainrestrictions from "./sending-domain-restrictions/index.js";
import $submissions from "./submissions/index.js";
import $trusteddomains from "./trusted-domains/index.js";
import $urlignorepatterns from "./url-ignore-patterns/index.js";
/**
 * email-security command
 * @generated from apis/overlays/email-security.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "email-security",
	describe:
		"Cloud email security — investigate threats, manage allow/block policies, and detect phishing",

	routes: {
		"allow-policies": $allowpolicies,
		analytics: $analytics,
		"block-senders": $blocksenders,
		"bulk-actions": $bulkactions,
		"content-policies": $contentpolicies,
		domains: $domains,
		"impersonation-registry": $impersonationregistry,
		investigate: $investigate,
		phishguard: $phishguard,
		"sending-domain-restrictions": $sendingdomainrestrictions,
		submissions: $submissions,
		"trusted-domains": $trusteddomains,
		"url-ignore-patterns": $urlignorepatterns,
	},
});

export default command;
