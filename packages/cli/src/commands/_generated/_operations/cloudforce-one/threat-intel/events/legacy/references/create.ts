/** @generated from cloudforce-one.threat-intel.events.legacy.references.create */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cloudforce-one/events/relate/${request.event_id}/create`,
	body: "json",
	errors: {
		400: "BadRequestError",
	},
} as const;
