/** @generated from ai-search.items.list */
export default {
	method: "GET",
	path: "/accounts/{account_id}/ai-search/namespaces/{name}/instances/{id}/items",
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
