/** @generated from generated:get:/{account_or_zone}/{account_or_zone_id}/firewall/access_rules/rules */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/${request.account_or_zone}/${request.account_or_zone_id}/firewall/access_rules/rules`,
	query: [
		"mode",
		"configuration.target",
		"configuration.value",
		"notes",
		"match",
		"page",
		"per_page",
		"order",
		"direction",
	],
} as const;
