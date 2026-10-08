/** @generated from zero-trust.casb.webhooks.create */
export default {
	method: "POST",
	path: "/accounts/{account_id}/data-security/posture/webhooks",
	body: "json",
	errors: {
		400: "BadRequestError",
		401: "UnauthorizedError",
		403: "ForbiddenError",
		422: "UnprocessableEntityError",
	},
} as const;
