/** @generated from cloudforce-one.threat-intel.events.legacy.raw.update */
import { path } from "#api";

export default {
	method: "PATCH",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cloudforce-one/events/${request.event_id}/raw/${request.raw_id}`,
	body: "json",
	errors: {
		400: "BadRequestError",
	},
} as const;
