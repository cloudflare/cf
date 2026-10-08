/** @generated from ai-search.items.upload */
export default {
	method: "POST",
	path: "/accounts/{account_id}/ai-search/namespaces/{name}/instances/{id}/items",
	body: "form",
	errors: {
		400: "BadRequestError",
		404: "NotFoundError",
		409: "ConflictError",
		413: "ContentTooLargeError",
		429: "TooManyRequestsError",
		499: "ClientClosedRequestError",
	},
} as const;
