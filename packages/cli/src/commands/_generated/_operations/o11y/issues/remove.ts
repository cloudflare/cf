/** @generated from o11y.issues.remove */
export default {
	method: "DELETE",
	path: "/accounts/{account_id}/workers/observability/issues/groups/{groupId}/members/{issueId}",
	errors: {
		400: "BadRequestError",
		401: "UnauthorizedError",
		403: "ForbiddenError",
		404: "NotFoundError",
		409: "ConflictError",
		500: "InternalServerError",
	},
} as const;
