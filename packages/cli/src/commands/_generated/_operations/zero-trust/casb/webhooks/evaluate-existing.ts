/** @generated from zero-trust.casb.webhooks.evaluate-existing */
export default {
	method: "POST",
	path: "/accounts/{account_id}/data-security/posture/webhooks/{webhook_id}/evaluate",
	errors: {
		400: "BadRequestError",
		401: "UnauthorizedError",
		403: "ForbiddenError",
		404: "NotFoundError",
	},
} as const;
