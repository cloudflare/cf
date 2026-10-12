/** @generated from spectrum-aggregate-analytics-get-current-aggregated-analytics */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/spectrum/analytics/aggregate/current`,
	query: ["appID", "colo_name"],
} as const;
