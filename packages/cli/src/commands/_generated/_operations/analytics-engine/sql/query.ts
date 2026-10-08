/** @generated from analytics-engine.sql.query */
export default {
	method: "POST",
	path: "/accounts/{account_id}/analytics_engine/sql",
	errors: {
		400: "BadRequestError",
		403: "ForbiddenError",
		422: "UnprocessableEntityError",
		429: "TooManyRequestsError",
		500: "InternalServerError",
		503: "ServiceUnavailableError",
		504: "GatewayTimeoutError",
	},
} as const;
