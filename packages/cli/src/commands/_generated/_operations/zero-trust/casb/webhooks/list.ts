/** @generated from zero-trust.casb.webhooks.list */
export default {
	method: "GET",
	path: "/accounts/{account_id}/data-security/posture/webhooks",
	errors: {
		401: "UnauthorizedError",
		403: "ForbiddenError",
	},
} as const;
