/** @generated from o11y.issues.group */
export default {
	method: "POST",
	path: "/accounts/{account_id}/workers/observability/issues/groups",
	body: "json",
	errors: {
		400: "BadRequestError",
		401: "UnauthorizedError",
		403: "ForbiddenError",
		404: "NotFoundError",
		409: "ConflictError",
		500: "InternalServerError",
	},
} as const;
