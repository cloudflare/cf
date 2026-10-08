/** @generated from o11y.queries.list */
export default {
	method: "GET",
	path: "/accounts/{account_id}/workers/observability/queries",
	query: ["page", "perPage", "order", "orderBy"],
	errors: {
		401: "UnauthorizedError",
		404: "NotFoundError",
		500: "InternalServerError",
	},
} as const;
