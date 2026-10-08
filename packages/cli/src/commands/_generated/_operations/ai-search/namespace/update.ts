/** @generated from ai-search.namespace.update */
export default {
	method: "PUT",
	path: "/accounts/{account_id}/ai-search/namespaces/{name}",
	body: "json",
	errors: {
		400: "BadRequestError",
		404: "NotFoundError",
		409: "ConflictError",
	},
} as const;
