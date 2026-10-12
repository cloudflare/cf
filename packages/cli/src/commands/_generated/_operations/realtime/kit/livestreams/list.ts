/** @generated from fetch_all_livestreams */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/realtime/kit/${request.app_id}/livestreams`,
	query: [
		"exclude_meetings",
		"per_page",
		"page_no",
		"status",
		"start_time",
		"end_time",
		"sort_order",
	],
} as const;
