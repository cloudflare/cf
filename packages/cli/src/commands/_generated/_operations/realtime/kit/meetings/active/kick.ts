/** @generated from realtime.kit.meetings.active.kick */
export default {
	method: "POST",
	path: "/accounts/{account_id}/realtime/kit/{app_id}/meetings/{meeting_id}/active-session/kick",
	body: "json",
	errors: {
		404: "NotFoundError",
	},
} as const;
