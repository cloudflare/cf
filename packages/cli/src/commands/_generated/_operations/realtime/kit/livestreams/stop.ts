/** @generated from realtime.kit.livestreams.stop */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/realtime/kit/${request.app_id}/meetings/${request.meeting_id}/active-livestream/stop`,
} as const;
