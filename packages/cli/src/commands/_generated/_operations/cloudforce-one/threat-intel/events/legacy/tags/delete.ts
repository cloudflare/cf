/** @generated from cloudforce-one.threat-intel.events.legacy.tags.delete */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cloudforce-one/events/event_tag/${request.event_id}`,
	body: "json",
	errors: {
		400: "BadRequestError",
	},
} as const;
