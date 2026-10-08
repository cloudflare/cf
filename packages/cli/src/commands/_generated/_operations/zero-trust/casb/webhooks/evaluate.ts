/** @generated from zero-trust.casb.webhooks.evaluate */
export default {
	method: "POST",
	path: "/accounts/{account_id}/data-security/posture/webhooks/evaluate",
	body: "json",
	errors: {
		400: "BadRequestError",
		401: "UnauthorizedError",
		403: "ForbiddenError",
	},
} as const;
