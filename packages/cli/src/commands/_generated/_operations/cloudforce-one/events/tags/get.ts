/** @generated from cloudforce-one.events.tags.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cloudforce-one/events/tags`,
	query: ["page", "pageSize", "search", "categoryUuid", "filters", "cache"],
	errors: {
		400: "BadRequestError",
	},
} as const;
