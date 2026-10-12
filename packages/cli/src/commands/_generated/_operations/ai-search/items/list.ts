/** @generated from ai-search-namespace-instance-list-items */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/ai-search/namespaces/${request.name}/instances/${request.id}/items`,
	query: [
		"page",
		"per_page",
		"search",
		"sort_by",
		"status",
		"source",
		"metadata_filter",
		"item_id",
		"key",
	],
	errors: {
		400: "BadRequestError",
		404: "NotFoundError",
		503: "ServiceUnavailableError",
	},
} as const;
