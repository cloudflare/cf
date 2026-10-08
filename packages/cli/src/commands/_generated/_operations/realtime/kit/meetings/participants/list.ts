/** @generated from realtime.kit.meetings.participants.list */
export default {
	method: "GET",
	path: "/accounts/{account_id}/realtime/kit/{app_id}/meetings/{meeting_id}/participants",
	query: ["page_no", "per_page"],
	errors: {
		500: "InternalServerError",
	},
} as const;
