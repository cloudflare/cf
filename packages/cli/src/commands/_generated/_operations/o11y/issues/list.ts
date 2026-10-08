/** @generated from o11y.issues.list */
export default {
	method: "GET",
	path: "/accounts/{account_id}/workers/observability/issues",
	query: [
		"page",
		"perPage",
		"order",
		"orderBy",
		"search",
		"service",
		"type",
		"status",
	],
	errors: {
		401: "UnauthorizedError",
		403: "ForbiddenError",
		404: "NotFoundError",
		500: "InternalServerError",
	},
} as const;
