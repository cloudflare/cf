/** @generated from realtime.kit.sessions.summaries.generate */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/realtime/kit/${request.app_id}/sessions/${request.session_id}/summary`,
} as const;
