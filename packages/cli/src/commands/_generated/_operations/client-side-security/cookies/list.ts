/** @generated from page-shield-list-cookies */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/page_shield/cookies`,
	query: [
		"hosts",
		"page",
		"per_page",
		"order_by",
		"direction",
		"page_url",
		"export",
		"name",
		"secure",
		"http_only",
		"same_site",
		"type",
		"path",
		"domain",
	],
} as const;
