/** @generated from firewall.waf.packages.rules.list */
export default {
	method: "GET",
	path: "/zones/{zone_id}/firewall/waf/packages/{package_id}/rules",
	query: [
		"mode",
		"group_id",
		"page",
		"per_page",
		"order",
		"direction",
		"match",
		"description",
		"priority",
	],
} as const;
