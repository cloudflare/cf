/** @generated from o11y.queries.delete */
export default {
	method: "DELETE",
	path: "/accounts/{account_id}/workers/observability/queries/{queryId}",
	errors: {
		401: "UnauthorizedError",
		404: "NotFoundError",
		500: "InternalServerError",
	},
} as const;
