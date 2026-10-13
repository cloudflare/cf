/** @generated from magic-transit.advanced-dns-protection.configs.dns.protection.rules.list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/magic/advanced_dns_protection/configs/dns_protection/rules`,
	query: ["page", "per_page", "order", "direction"],
	joined: ["page", "per_page", "order", "direction"],
} as const;
