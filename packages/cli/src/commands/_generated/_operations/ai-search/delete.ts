/** @generated from ai-search.delete */
export default {
	method: "DELETE",
	path: "/accounts/{account_id}/ai-search/namespaces/{name}/instances/{id}",
	errors: {
		404: "NotFoundError",
		409: "ConflictError",
	},
} as const;
