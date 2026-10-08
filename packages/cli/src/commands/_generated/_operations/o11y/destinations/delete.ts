/** @generated from o11y.destinations.delete */
export default {
	method: "DELETE",
	path: "/accounts/{account_id}/workers/observability/destinations/{slug}",
	errors: {
		401: "UnauthorizedError",
		404: "NotFoundError",
		409: "ConflictError",
		500: "InternalServerError",
	},
} as const;
