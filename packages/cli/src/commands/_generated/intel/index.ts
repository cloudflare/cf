import $asn from "./asn/index.js";
import $attacksurfacereport from "./attack-surface-report/index.js";
import $dns from "./dns/index.js";
import $domainhistory from "./domain-history/index.js";
import $domains from "./domains/index.js";
import $indicatorfeeds from "./indicator-feeds/index.js";
import $iplists from "./ip-lists/index.js";
import $ips from "./ips/index.js";
import $miscategorizations from "./miscategorizations/index.js";
import $sinkholes from "./sinkholes/index.js";
import $urls from "./urls/index.js";
import $whois from "./whois/index.js";
/**
 * intel command
 * @generated from apis/overlays/intel.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "intel",
	describe:
		"Threat intelligence lookups — IP reputation, domain info, ASN details, WHOIS, and indicator feeds",

	routes: {
		asn: $asn,
		"attack-surface-report": $attacksurfacereport,
		dns: $dns,
		"domain-history": $domainhistory,
		domains: $domains,
		"indicator-feeds": $indicatorfeeds,
		"ip-lists": $iplists,
		ips: $ips,
		miscategorizations: $miscategorizations,
		sinkholes: $sinkholes,
		urls: $urls,
		whois: $whois,
	},
});

export default command;
