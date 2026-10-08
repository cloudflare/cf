/** @generated from ai-search.tokens.update */
export default {
	method: "PUT",
	path: "/accounts/{account_id}/ai-search/tokens/{id}",
	body: "json",
	errors: {
		400: "BadRequestError",
		404: "NotFoundError",
	},
} as const;
