/** @generated from zero-trust.casb.policies.get */
export default {
	method: "GET",
	path: "/accounts/{account_id}/data-security/posture/policies/{policy_id}",
	errors: {
		400: "BadRequestError",
		401: "UnauthorizedError",
		403: "ForbiddenError",
		404: "NotFoundError",
	},
} as const;
