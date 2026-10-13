/** @generated from realtime.kit.sessions.chat.export */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/realtime/kit/${request.app_id}/sessions/${request.session_id}/chat`,
} as const;
