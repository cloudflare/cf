/** @generated from GetActiveSession */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/realtime/kit/${request.app_id}/meetings/${request.meeting_id}/active-session`,
	errors: {
		404: "NotFoundError",
	},
} as const;
