/** @generated from realtime.kit.sessions.participants.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/realtime/kit/${request.app_id}/sessions/${request.session_id}/participants/${request.participant_id}`,
	query: ["include_peer_events"],
} as const;
