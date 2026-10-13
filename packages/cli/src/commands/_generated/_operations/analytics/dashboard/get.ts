/** @generated from analytics.dashboard.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_identifier}/analytics/dashboard`,
	query: ["until", "since", "continuous"],
} as const;
