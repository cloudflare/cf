/** @generated from api-shield-api-discovery-retrieve-discovered-operations-on-a-zone */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/api_gateway/discovery/operations`,
	query: [
		"page",
		"per_page",
		"host",
		"method",
		"endpoint",
		"direction",
		"order",
		"diff",
		"origin",
		"state",
	],
} as const;
