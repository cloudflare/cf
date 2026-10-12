/** @generated from spectrum-analytics-(-by-time)-get-analytics-by-time */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/spectrum/analytics/events/bytime`,
	query: [
		"dimensions",
		"sort",
		"until",
		"metrics",
		"filters",
		"since",
		"time_delta",
	],
} as const;
