/** @generated from zero-trust.casb.findings.instances.unarchive */
export default {
	method: "POST",
	path: "/accounts/{account_id}/data-security/posture/findings/{finding_id}/instances/unarchive",
	body: "json",
	errors: {
		400: "BadRequestError",
		404: "NotFoundError",
	},
} as const;
