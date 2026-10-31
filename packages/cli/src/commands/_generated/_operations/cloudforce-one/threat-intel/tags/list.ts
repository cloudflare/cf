/** @generated from cloudforce-one.threat-intel.tags.list */
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
