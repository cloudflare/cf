/** @generated from firewall.access-rules.list */
export default {
	method: "GET",
	path: "/{account_or_zone}/{account_or_zone_id}/firewall/access_rules/rules",
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
