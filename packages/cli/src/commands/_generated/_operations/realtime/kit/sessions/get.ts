/** @generated from realtime.kit.sessions.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/realtime/kit/${request.app_id}/sessions/${request.session_id}`,
	query: ["include_breakout_rooms"],
} as const;
