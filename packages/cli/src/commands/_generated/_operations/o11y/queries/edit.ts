/** @generated from o11y.queries.edit */
export default {
	method: "PATCH",
	path: "/accounts/{account_id}/workers/observability/queries/{queryId}",
	body: "json",
	errors: {
		401: "UnauthorizedError",
		404: "NotFoundError",
		500: "InternalServerError",
	},
} as const;
