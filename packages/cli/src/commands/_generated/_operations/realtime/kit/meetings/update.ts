/** @generated from update_meeting */
import { path } from "#api";

export default {
	method: "PATCH",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/realtime/kit/${request.app_id}/meetings/${request.meeting_id}`,
	body: "json",
	errors: {
		500: "InternalServerError",
	},
} as const;
