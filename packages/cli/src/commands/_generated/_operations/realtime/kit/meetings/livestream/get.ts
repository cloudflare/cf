/** @generated from realtime.kit.meetings.livestream.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/realtime/kit/${request.app_id}/meetings/${request.meeting_id}/livestream`,
	query: ["page_no", "per_page"],
} as const;
