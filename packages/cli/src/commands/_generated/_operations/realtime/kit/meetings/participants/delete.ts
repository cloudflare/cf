/** @generated from realtime.kit.meetings.participants.delete */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/realtime/kit/${request.app_id}/meetings/${request.meeting_id}/participants/${request.participant_id}`,
	errors: {
		500: "InternalServerError",
	},
} as const;
