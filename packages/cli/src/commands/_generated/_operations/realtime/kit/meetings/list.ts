/** @generated from realtime.kit.meetings.list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/realtime/kit/${request.app_id}/meetings`,
	query: ["page_no", "per_page", "start_time", "end_time", "search", "status"],
} as const;
