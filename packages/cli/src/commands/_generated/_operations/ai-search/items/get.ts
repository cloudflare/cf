/** @generated from ai-search.items.get */
export default {
	method: "GET",
	path: "/accounts/{account_id}/ai-search/namespaces/{name}/instances/{id}/items/{item_id}",
	errors: {
		404: "NotFoundError",
		503: "ServiceUnavailableError",
	},
} as const;
