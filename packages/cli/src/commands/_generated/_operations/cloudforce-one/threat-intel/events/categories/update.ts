/** @generated from cloudforce-one.threat-intel.events.categories.update */
import { path } from "#api";

export default {
	method: "PATCH",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cloudforce-one/events/event-categories/by-id/${request.category_id}`,
	body: "json",
	errors: {
		400: "BadRequestError",
	},
} as const;
