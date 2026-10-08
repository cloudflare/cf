/** @generated from cloudforce-one.priority-intelligence.filters.generate */
export default {
	method: "POST",
	path: "/accounts/{account_id}/cloudforce-one/v2/priority-intelligence/filters/generate",
	body: "json",
	errors: {
		400: "BadRequestError",
		429: "TooManyRequestsError",
		502: "BadGatewayError",
		503: "ServiceUnavailableError",
	},
} as const;
