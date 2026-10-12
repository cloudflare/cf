/** @generated from web-assets.operations.list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/api_gateway/operations`,
	query: [
		"page",
		"per_page",
		"order",
		"direction",
		"host",
		"method",
		"endpoint",
		"feature",
	],
} as const;
