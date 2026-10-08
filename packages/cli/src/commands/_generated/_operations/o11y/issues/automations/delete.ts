/** @generated from o11y.issues.automations.delete */
export default {
	method: "DELETE",
	path: "/accounts/{account_id}/workers/observability/issues/automations/{automationId}",
	errors: {
		401: "UnauthorizedError",
		403: "ForbiddenError",
		404: "NotFoundError",
		500: "InternalServerError",
	},
} as const;
