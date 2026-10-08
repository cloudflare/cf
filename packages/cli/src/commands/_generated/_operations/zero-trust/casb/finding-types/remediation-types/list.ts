/** @generated from zero-trust.casb.finding-types.remediation-types.list */
export default {
	method: "GET",
	path: "/accounts/{account_id}/data-security/posture/finding_types/{finding_type_id}/remediation_types",
	query: ["integration_id", "cursor", "page", "per_page"],
	errors: {
		400: "BadRequestError",
		404: "NotFoundError",
	},
} as const;
