/** @generated from GetSessionParticipants */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/realtime/kit/${request.app_id}/sessions/${request.session_id}/participants`,
	query: [
		"search",
		"page_no",
		"per_page",
		"sort_order",
		"sort_by",
		"include_peer_events",
		"view",
	],
} as const;
