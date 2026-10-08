/** @generated from realtime.kit.sessions.list */
export default {
	method: "GET",
	path: "/accounts/{account_id}/realtime/kit/{app_id}/sessions",
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
