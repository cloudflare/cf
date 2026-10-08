/** @generated from client-side-security.scripts.list */
export default {
	method: "GET",
	path: "/zones/{zone_id}/page_shield/scripts",
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
		"exclude_duplicates",
		"status",
		"page_url",
		"export",
	],
} as const;
