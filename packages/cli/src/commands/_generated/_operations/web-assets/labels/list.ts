/** @generated from web-assets.labels.list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/api_gateway/labels`,
	query: [
		"page",
		"per_page",
		"order",
		"direction",
		"source",
		"filter",
		"with_mapped_resource_counts",
	],
} as const;
