/** @generated from generated:get:/{account_or_zone}/{account_or_zone_id}/firewall/access_rules/rules/{rule_id} */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/${request.account_or_zone}/${request.account_or_zone_id}/firewall/access_rules/rules/${request.rule_id}`,
} as const;
