/** @generated from firewall.waf.packages.groups.list */
export default {
	method: "GET",
	path: "/zones/{zone_id}/firewall/waf/packages/{package_id}/groups",
	query: [
		"mode",
		"page",
		"per_page",
		"order",
		"direction",
		"match",
		"name",
		"rules_count",
	],
} as const;
