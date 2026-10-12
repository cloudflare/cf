/** @generated from cloudforce-one.events.categories.legacy.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cloudforce-one/events/categories/${request.category_id}`,
	errors: {
		400: "BadRequestError",
	},
} as const;
