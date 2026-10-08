/** @generated from ai-search.move */
export default {
	method: "PATCH",
	path: "/accounts/{account_id}/ai-search/namespaces/{name}/instances/{id}",
	body: "json",
	errors: {
		400: "BadRequestError",
		404: "NotFoundError",
		409: "ConflictError",
	},
} as const;
