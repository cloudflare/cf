/** @generated from o11y.issues.notify */
export default {
	method: "POST",
	path: "/accounts/{account_id}/workers/observability/issues/{issueId}/notification-runs",
	body: "json",
	errors: {
		400: "BadRequestError",
		401: "UnauthorizedError",
		403: "ForbiddenError",
		404: "NotFoundError",
		500: "InternalServerError",
	},
} as const;
