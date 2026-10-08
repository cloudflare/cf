/** @generated from ai-search.tokens.delete */
export default {
	method: "DELETE",
	path: "/accounts/{account_id}/ai-search/tokens/{id}",
	errors: {
		400: "BadRequestError",
		404: "NotFoundError",
		409: "ConflictError",
	},
} as const;
