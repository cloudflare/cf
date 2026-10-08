/** @generated from realtime.kit.recordings.list */
export default {
	method: "GET",
	path: "/accounts/{account_id}/realtime/kit/{app_id}/recordings",
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
