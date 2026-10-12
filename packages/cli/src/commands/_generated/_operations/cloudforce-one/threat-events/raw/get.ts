/** @generated from get_EventRawRead */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cloudforce-one/events/${request.event_id}/raw/${request.raw_id}`,
	errors: {
		400: "BadRequestError",
	},
} as const;
