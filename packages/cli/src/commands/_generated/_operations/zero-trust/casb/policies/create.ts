/** @generated from zero-trust.casb.policies.create */
export default {
	method: "POST",
	path: "/accounts/{account_id}/data-security/posture/policies",
	body: "json",
	errors: {
		400: "BadRequestError",
		401: "UnauthorizedError",
		403: "ForbiddenError",
		404: "NotFoundError",
	},
} as const;
