/** @generated from spectrum.analytics.events.summaries.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/spectrum/analytics/events/summary`,
	query: ["dimensions", "sort", "until", "metrics", "filters", "since"],
} as const;
