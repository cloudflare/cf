/** @generated from firewall.access-rules.edit */
import { path } from "#api";

export default {
	method: "PATCH",
	path: (request: Record<string, unknown>) =>
		path`/${request.account_or_zone}/${request.account_or_zone_id}/firewall/access_rules/rules/${request.rule_id}`,
	body: "json",
} as const;
