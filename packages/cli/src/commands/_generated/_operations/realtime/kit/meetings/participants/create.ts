/** @generated from add_participant */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/realtime/kit/${request.app_id}/meetings/${request.meeting_id}/participants`,
	body: "json",
	errors: {
		500: "InternalServerError",
	},
} as const;
