/** @generated from deleteDnsProtectionRulesForAccount */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/magic/advanced_dns_protection/configs/dns_protection/rules`,
} as const;
