/** @generated from ai-search.items.upsert */
export default {
	method: "PUT",
	path: "/accounts/{account_id}/ai-search/namespaces/{name}/instances/{id}/items",
	body: "json",
	constants: {
		next_action: "INDEX",
	},
	errors: {
		400: "BadRequestError",
		404: "NotFoundError",
		409: "ConflictError",
		429: "TooManyRequestsError",
		503: "ServiceUnavailableError",
	},
} as const;
