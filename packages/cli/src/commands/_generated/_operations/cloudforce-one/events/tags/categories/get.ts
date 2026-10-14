/** @generated from cloudforce-one.events.tags.categories.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cloudforce-one/events/tags/categories`,
	query: ["search"],
	errors: {
		400: "BadRequestError",
	},
} as const;
