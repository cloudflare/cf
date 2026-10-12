/** @generated from updateDnsProtectionRule */
import { path } from "#api";

export default {
	method: "PATCH",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/magic/advanced_dns_protection/configs/dns_protection/rules/${request.rule_id}`,
	body: "json",
} as const;
