/** @generated from o11y.destinations.create */
export default {
	method: "POST",
	path: "/accounts/{account_id}/workers/observability/destinations",
	body: "json",
	errors: {
		400: "BadRequestError",
		401: "UnauthorizedError",
		403: "ForbiddenError",
		500: "InternalServerError",
	},
} as const;
