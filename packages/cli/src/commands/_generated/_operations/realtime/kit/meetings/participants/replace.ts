/** @generated from replace_participant */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/realtime/kit/${request.app_id}/meetings/${request.meeting_id}/participants/${request.participant_id}`,
	body: "json",
	errors: {
		500: "InternalServerError",
	},
} as const;
