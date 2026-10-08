/** @generated from o11y.queries.create */
export default {
	method: "POST",
	path: "/accounts/{account_id}/workers/observability/queries",
	body: "json",
	errors: {
		401: "UnauthorizedError",
		409: "ConflictError",
		500: "InternalServerError",
	},
} as const;
