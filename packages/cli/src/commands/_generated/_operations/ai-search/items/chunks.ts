/** @generated from ai-search.items.chunks */
export default {
	method: "GET",
	path: "/accounts/{account_id}/ai-search/namespaces/{name}/instances/{id}/items/{item_id}/chunks",
	query: ["limit", "offset"],
	errors: {
		400: "BadRequestError",
		404: "NotFoundError",
		503: "ServiceUnavailableError",
	},
} as const;
