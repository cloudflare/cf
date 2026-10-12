/** @generated from realtime.kit.analytics.usage.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/realtime/kit/${request.app_id}/analytics/daywise`,
	query: ["start_date", "end_date"],
} as const;
