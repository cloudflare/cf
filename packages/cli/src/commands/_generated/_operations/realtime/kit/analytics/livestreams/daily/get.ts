/** @generated from get-livestream-analytics-daywise */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/realtime/kit/${request.app_id}/analytics/livestreams/daywise`,
	query: ["start_time", "end_time", "filters"],
} as const;
