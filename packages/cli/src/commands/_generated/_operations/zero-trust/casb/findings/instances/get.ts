/** @generated from zero-trust.casb.findings.instances.get */
export default {
	method: "GET",
	path: "/accounts/{account_id}/data-security/posture/findings/{finding_id}/instances/{instance_id}",
	errors: {
		400: "BadRequestError",
		404: "NotFoundError",
	},
} as const;
