/** @generated from GetSessions */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/realtime/kit/${request.app_id}/sessions`,
	query: [
		"page_no",
		"per_page",
		"sort_by",
		"sort_order",
		"start_time",
		"end_time",
		"participants",
		"status",
		"search",
		"associated_id",
	],
} as const;
