/** @generated from get-v2-livestreamsession-session-meetingId-active-livestream */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/realtime/kit/${request.app_id}/sessions/${request.session_id}/livestream-sessions`,
	query: ["per_page", "page_no"],
} as const;
