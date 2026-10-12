/** @generated from realtime.kit.livestreams.sessions.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/realtime/kit/${request.app_id}/livestreams/sessions/${request["livestream-session-id"]}`,
} as const;
