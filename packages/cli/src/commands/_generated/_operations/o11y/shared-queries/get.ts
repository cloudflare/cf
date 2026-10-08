/** @generated from o11y.shared-queries.get */
export default {
	method: "GET",
	path: "/accounts/{account_id}/workers/observability/shared/query/{id}",
	query: ["view"],
	errors: {
		400: "BadRequestError",
		401: "UnauthorizedError",
		403: "ForbiddenError",
		500: "InternalServerError",
	},
} as const;
