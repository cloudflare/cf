/** @generated from ai-search.create */
export default {
	method: "POST",
	path: "/accounts/{account_id}/ai-search/namespaces/{name}/instances",
	body: "json",
	errors: {
		400: "BadRequestError",
		403: "ForbiddenError",
		409: "ConflictError",
	},
} as const;
