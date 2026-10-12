/** @generated from cloudforce-one.events.tags.categories.actors.list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cloudforce-one/events/tags/categories/actors`,
	query: ["page", "pageSize", "value", "filters"],
	errors: {
		400: "BadRequestError",
	},
} as const;
