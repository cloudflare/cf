/** @generated from page-shield-list-connections */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/page_shield/connections`,
	query: [
		"exclude_urls",
		"urls",
		"hosts",
		"page",
		"per_page",
		"order_by",
		"direction",
		"prioritize_malicious",
		"exclude_cdn_cgi",
		"status",
		"page_url",
		"export",
	],
} as const;
