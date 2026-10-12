/** @generated from ip-access-rules-for-a-user-list-ip-access-rules */
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
