/** @generated from realtime.kit.meetings.get */
export default {
	method: "GET",
	path: "/accounts/{account_id}/realtime/kit/{app_id}/meetings/{meeting_id}",
	query: ["name"],
	errors: {
		500: "InternalServerError",
	},
} as const;
