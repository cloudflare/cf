/** @generated from zero-trust.casb.policies.delete */
export default {
	method: "DELETE",
	path: "/accounts/{account_id}/data-security/posture/policies/{policy_id}",
	errors: {
		400: "BadRequestError",
		401: "UnauthorizedError",
		403: "ForbiddenError",
		404: "NotFoundError",
	},
} as const;
