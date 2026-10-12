/** @generated from createDnsProtectionRule */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/magic/advanced_dns_protection/configs/dns_protection/rules`,
	body: "json",
} as const;
