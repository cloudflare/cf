/** @generated from zone-lockdown-list-zone-lockdown-rules */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/firewall/lockdowns`,
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
