/** @generated from o11y.usage */
export default {
	method: "GET",
	path: "/accounts/{account_id}/workers/observability/usage",
	query: ["from", "to", "tz"],
	errors: {
		400: "BadRequestError",
		401: "UnauthorizedError",
		403: "ForbiddenError",
		429: "TooManyRequestsError",
		500: "InternalServerError",
		504: "GatewayTimeoutError",
	},
} as const;
