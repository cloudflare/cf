/** @generated from zero-trust.casb.webhooks.jobs.create */
export default {
	method: "POST",
	path: "/accounts/{account_id}/data-security/posture/webhooks/jobs",
	body: "json",
	errors: {
		400: "BadRequestError",
		401: "UnauthorizedError",
		403: "ForbiddenError",
		404: "NotFoundError",
	},
} as const;
