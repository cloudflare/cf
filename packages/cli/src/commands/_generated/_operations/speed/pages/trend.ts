/** @generated from speed.pages.trend */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/speed_api/pages/${request.url}/trend`,
	query: ["region", "deviceType", "start", "end", "tz", "metrics"],
} as const;
