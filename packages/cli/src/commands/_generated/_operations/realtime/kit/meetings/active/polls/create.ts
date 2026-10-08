/** @generated from realtime.kit.meetings.active.polls.create */
export default {
	method: "POST",
	path: "/accounts/{account_id}/realtime/kit/{app_id}/meetings/{meeting_id}/active-session/poll",
	body: "json",
	errors: {
		400: "BadRequestError",
	},
} as const;
