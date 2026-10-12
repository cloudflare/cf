/** @generated from get_meeting_participants */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/realtime/kit/${request.app_id}/meetings/${request.meeting_id}/participants`,
	query: ["page_no", "per_page"],
	errors: {
		500: "InternalServerError",
	},
} as const;
