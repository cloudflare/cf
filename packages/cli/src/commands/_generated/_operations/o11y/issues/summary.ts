/** @generated from o11y.issues.summary */
export default {
	method: "GET",
	path: "/accounts/{account_id}/workers/observability/issues/summary",
	query: ["service"],
	errors: {
		401: "UnauthorizedError",
		403: "ForbiddenError",
		404: "NotFoundError",
		500: "InternalServerError",
	},
} as const;
