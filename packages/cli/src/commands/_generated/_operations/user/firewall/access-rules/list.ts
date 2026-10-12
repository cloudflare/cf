/** @generated from user.firewall.access-rules.list */
export default {
	method: "GET",
	path: () => "/user/firewall/access_rules/rules",
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
