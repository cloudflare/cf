/** @generated from firewall.access-rules.delete */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/${request.account_or_zone}/${request.account_or_zone_id}/firewall/access_rules/rules/${request.rule_id}`,
} as const;
