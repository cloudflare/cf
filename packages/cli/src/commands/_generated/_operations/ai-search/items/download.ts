/** @generated from ai-search.items.download */
export default {
	method: "GET",
	path: "/accounts/{account_id}/ai-search/namespaces/{name}/instances/{id}/items/{item_id}/download",
	response: "binary-response",
	errors: {
		400: "BadRequestError",
		403: "ForbiddenError",
		404: "NotFoundError",
		409: "ConflictError",
		503: "ServiceUnavailableError",
	},
} as const;
