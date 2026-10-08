/** @generated from zero-trust.casb.finding-types.get */
export default {
	method: "GET",
	path: "/accounts/{account_id}/data-security/posture/finding_types/{finding_type_id}",
	errors: {
		400: "BadRequestError",
		404: "NotFoundError",
	},
} as const;
