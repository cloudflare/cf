/** @generated from firewall.waf.packages.rules.list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/firewall/waf/packages/${request.package_id}/rules`,
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
