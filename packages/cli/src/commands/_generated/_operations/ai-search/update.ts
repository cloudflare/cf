/** @generated from ai-search.update */
export default {
	method: "PUT",
	path: "/accounts/{account_id}/ai-search/namespaces/{name}/instances/{id}",
	body: "json",
	errors: {
		400: "BadRequestError",
		404: "NotFoundError",
		409: "ConflictError",
	},
} as const;
