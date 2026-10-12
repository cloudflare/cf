/** @generated from CreatePoll */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/realtime/kit/${request.app_id}/meetings/${request.meeting_id}/active-session/poll`,
	body: "json",
	errors: {
		400: "BadRequestError",
	},
} as const;
