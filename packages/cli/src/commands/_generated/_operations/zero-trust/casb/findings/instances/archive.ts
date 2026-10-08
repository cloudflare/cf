/** @generated from zero-trust.casb.findings.instances.archive */
export default {
	method: "POST",
	path: "/accounts/{account_id}/data-security/posture/findings/{finding_id}/instances/archive",
	body: "json",
	errors: {
		400: "BadRequestError",
		404: "NotFoundError",
	},
} as const;
