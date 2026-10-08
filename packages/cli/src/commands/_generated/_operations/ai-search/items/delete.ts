/** @generated from ai-search.items.delete */
export default {
	method: "DELETE",
	path: "/accounts/{account_id}/ai-search/namespaces/{name}/instances/{id}/items/{item_id}",
	errors: {
		400: "BadRequestError",
		404: "NotFoundError",
		409: "ConflictError",
		429: "TooManyRequestsError",
	},
} as const;
