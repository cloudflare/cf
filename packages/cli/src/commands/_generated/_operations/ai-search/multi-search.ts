/** @generated from ai-search.multi-search */
export default {
	method: "POST",
	path: "/accounts/{account_id}/ai-search/namespaces/{name}/search",
	body: "json",
	errors: {
		400: "BadRequestError",
		404: "NotFoundError",
		429: "TooManyRequestsError",
		502: "BadGatewayError",
	},
} as const;
