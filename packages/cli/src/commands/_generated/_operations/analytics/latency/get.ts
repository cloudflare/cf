/** @generated from analytics.latency.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/analytics/latency`,
	query: ["bins"],
} as const;
