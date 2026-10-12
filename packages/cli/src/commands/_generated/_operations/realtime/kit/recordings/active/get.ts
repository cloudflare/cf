/** @generated from realtime.kit.recordings.active.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/realtime/kit/${request.app_id}/recordings/active-recording/${request.meeting_id}`,
	errors: {
		404: "NotFoundError",
	},
} as const;
