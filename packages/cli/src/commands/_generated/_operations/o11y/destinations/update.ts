/** @generated from o11y.destinations.update */
export default {
	method: "PATCH",
	path: "/accounts/{account_id}/workers/observability/destinations/{slug}",
	body: "json",
	errors: {
		400: "BadRequestError",
		401: "UnauthorizedError",
		404: "NotFoundError",
		500: "InternalServerError",
	},
} as const;
