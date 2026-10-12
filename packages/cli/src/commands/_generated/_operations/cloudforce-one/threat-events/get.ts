/** @generated from get_EventReadDeprecated */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cloudforce-one/events/${request.event_id}`,
	errors: {
		404: "NotFoundError",
	},
} as const;
