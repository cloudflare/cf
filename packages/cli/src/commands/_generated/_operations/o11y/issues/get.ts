/** @generated from o11y.issues.get */
export default {
	method: "GET",
	path: "/accounts/{account_id}/workers/observability/issues/{issueId}",
	errors: {
		401: "UnauthorizedError",
		403: "ForbiddenError",
		404: "NotFoundError",
		500: "InternalServerError",
	},
} as const;
