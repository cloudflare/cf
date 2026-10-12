/** @generated from api-shield-endpoint-management-retrieve-information-about-all-operations-on-a-zone */
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
