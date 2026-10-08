/** @generated from ai-search.items.sync */
export default {
	method: "PATCH",
	path: "/accounts/{account_id}/ai-search/namespaces/{name}/instances/{id}/items/{item_id}",
	body: "json",
	constants: {
		next_action: "INDEX",
	},
	errors: {
		400: "BadRequestError",
		404: "NotFoundError",
		429: "TooManyRequestsError",
		503: "ServiceUnavailableError",
	},
} as const;
