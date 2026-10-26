/** @generated from cloudforce-one.threat-intel.events.categories.catalog.list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cloudforce-one/events/categories/catalog`,
	errors: {
		400: "BadRequestError",
	},
} as const;
