/** @generated from ai-search.chat-completions */
export default {
	method: "POST",
	path: "/accounts/{account_id}/ai-search/namespaces/{name}/instances/{id}/chat/completions",
	body: "json",
	errors: {
		400: "BadRequestError",
		404: "NotFoundError",
		429: "TooManyRequestsError",
		502: "BadGatewayError",
	},
} as const;
