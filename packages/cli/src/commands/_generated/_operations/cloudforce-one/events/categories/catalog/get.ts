/** @generated from cloudforce-one.events.categories.catalog.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cloudforce-one/events/categories/catalog`,
	errors: {
		400: "BadRequestError",
	},
} as const;
