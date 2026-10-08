/** @generated from ai-search.list */
export default {
	method: "GET",
	path: "/accounts/{account_id}/ai-search/namespaces/{name}/instances",
	query: [
		"page",
		"per_page",
		"search",
		"hostname",
		"order_by",
		"order_by_direction",
	],
	errors: {
		400: "BadRequestError",
	},
} as const;
