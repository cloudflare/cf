/** @generated from realtime.kit.meetings.participants.tokens.revoke */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/realtime/kit/${request.app_id}/meetings/${request.meeting_id}/participants/${request.participant_id}/token`,
	body: "json",
	errors: {
		400: "BadRequestError",
		403: "ForbiddenError",
		500: "InternalServerError",
	},
} as const;
