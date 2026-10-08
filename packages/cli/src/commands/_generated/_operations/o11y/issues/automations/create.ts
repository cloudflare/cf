/** @generated from o11y.issues.automations.create */
export default {
	method: "POST",
	path: "/accounts/{account_id}/workers/observability/issues/automations",
	body: "json",
	errors: {
		401: "UnauthorizedError",
		403: "ForbiddenError",
		404: "NotFoundError",
		500: "InternalServerError",
	},
} as const;
