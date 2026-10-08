/** @generated from firewall.lockdowns.list */
export default {
	method: "GET",
	path: "/zones/{zone_id}/firewall/lockdowns",
	query: [
		"page",
		"description",
		"modified_on",
		"ip",
		"priority",
		"uri_search",
		"ip_range_search",
		"per_page",
		"created_on",
		"description_search",
		"ip_search",
	],
} as const;
