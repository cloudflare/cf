/** @generated from realtime.kit.livestreams.sessions.list-active */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/realtime/kit/${request.app_id}/livestreams/${request.livestream_id}/active-livestream-session`,
} as const;
