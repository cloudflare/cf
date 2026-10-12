/** @generated from magic-transit.advanced-dns-protection.configs.dns.protection.rules.delete */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/magic/advanced_dns_protection/configs/dns_protection/rules/${request.rule_id}`,
} as const;
