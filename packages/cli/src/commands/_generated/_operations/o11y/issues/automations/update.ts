/** @generated from o11y.issues.automations.update */
export default {
	method: "PUT",
	path: "/accounts/{account_id}/workers/observability/issues/automations/{automationId}",
	body: "json",
	errors: {
		401: "UnauthorizedError",
		403: "ForbiddenError",
		404: "NotFoundError",
		500: "InternalServerError",
	},
} as const;
