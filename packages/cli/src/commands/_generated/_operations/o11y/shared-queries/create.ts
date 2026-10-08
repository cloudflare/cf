/** @generated from o11y.shared-queries.create */
export default {
	method: "POST",
	path: "/accounts/{account_id}/workers/observability/shared/query",
	body: "json",
	errors: {
		400: "BadRequestError",
		401: "UnauthorizedError",
		429: "TooManyRequestsError",
		500: "InternalServerError",
	},
} as const;
