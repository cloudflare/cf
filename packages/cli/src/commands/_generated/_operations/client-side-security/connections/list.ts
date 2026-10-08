/** @generated from client-side-security.connections.list */
export default {
	method: "GET",
	path: "/zones/{zone_id}/page_shield/connections",
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
