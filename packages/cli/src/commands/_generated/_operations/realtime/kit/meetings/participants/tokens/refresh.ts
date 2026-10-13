/** @generated from realtime.kit.meetings.participants.tokens.refresh */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/realtime/kit/${request.app_id}/meetings/${request.meeting_id}/participants/${request.participant_id}/token`,
	errors: {
		500: "InternalServerError",
	},
} as const;
