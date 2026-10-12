/** @generated from get_all_recordings */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/realtime/kit/${request.app_id}/recordings`,
	query: [
		"meeting_id",
		"page_no",
		"per_page",
		"expired",
		"search",
		"sort_by",
		"sort_order",
		"start_time",
		"end_time",
		"status",
	],
	joined: ["status"],
} as const;
