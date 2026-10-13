/** @generated from firewall.waf.packages.groups.list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/firewall/waf/packages/${request.package_id}/groups`,
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
