/** @generated from o11y.telemetry.values */
export default {
	method: "POST",
	path: "/accounts/{account_id}/workers/observability/telemetry/values",
	body: "json",
	errors: {
		400: "BadRequestError",
		401: "UnauthorizedError",
		403: "ForbiddenError",
		429: "TooManyRequestsError",
		500: "InternalServerError",
		504: "GatewayTimeoutError",
	},
} as const;
