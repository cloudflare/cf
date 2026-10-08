/** @generated from zero-trust.casb.webhooks.update */
export default {
	method: "PUT",
	path: "/accounts/{account_id}/data-security/posture/webhooks/{webhook_id}",
	body: "json",
	errors: {
		400: "BadRequestError",
		401: "UnauthorizedError",
		403: "ForbiddenError",
		404: "NotFoundError",
	},
} as const;
