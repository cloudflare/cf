/** @generated from o11y.issues.ungroup */
export default {
	method: "DELETE",
	path: "/accounts/{account_id}/workers/observability/issues/groups/{groupId}",
	errors: {
		401: "UnauthorizedError",
		403: "ForbiddenError",
		404: "NotFoundError",
		500: "InternalServerError",
	},
} as const;
