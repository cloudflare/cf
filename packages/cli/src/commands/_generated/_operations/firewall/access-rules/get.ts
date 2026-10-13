/** @generated from firewall.access-rules.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/${request.account_or_zone}/${request.account_or_zone_id}/firewall/access_rules/rules/${request.rule_id}`,
} as const;
