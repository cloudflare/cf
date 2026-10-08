/** @generated from zero-trust.casb.policies.update */
export default {
	method: "PUT",
	path: "/accounts/{account_id}/data-security/posture/policies/{policy_id}",
	body: "json",
	errors: {
		400: "BadRequestError",
		401: "UnauthorizedError",
		403: "ForbiddenError",
		404: "NotFoundError",
	},
} as const;
