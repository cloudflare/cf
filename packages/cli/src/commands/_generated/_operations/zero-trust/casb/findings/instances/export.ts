/** @generated from zero-trust.casb.findings.instances.export */
export default {
	method: "POST",
	path: "/accounts/{account_id}/data-security/posture/findings/{storage_namespace_id}/instances/export",
	body: "json",
	errors: {
		400: "BadRequestError",
		404: "NotFoundError",
	},
} as const;
