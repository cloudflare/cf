/** @generated from zero-trust.casb.policies.list */
export default {
	method: "GET",
	path: "/accounts/{account_id}/data-security/posture/policies",
	query: ["cursor"],
	errors: {
		400: "BadRequestError",
		401: "UnauthorizedError",
		403: "ForbiddenError",
	},
} as const;
