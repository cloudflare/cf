/** @generated from generated:post:/{account_or_zone}/{account_or_zone_id}/firewall/access_rules/rules */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/${request.account_or_zone}/${request.account_or_zone_id}/firewall/access_rules/rules`,
	body: "json",
} as const;
