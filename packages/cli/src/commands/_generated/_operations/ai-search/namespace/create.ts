/** @generated from ai-search.namespace.create */
export default {
	method: "POST",
	path: "/accounts/{account_id}/ai-search/namespaces",
	body: "json",
	errors: {
		400: "BadRequestError",
		403: "ForbiddenError",
		409: "ConflictError",
	},
} as const;
