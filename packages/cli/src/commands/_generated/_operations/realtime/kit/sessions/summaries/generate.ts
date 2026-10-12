/** @generated from post-sessions-session_id-summary */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/realtime/kit/${request.app_id}/sessions/${request.session_id}/summary`,
} as const;
