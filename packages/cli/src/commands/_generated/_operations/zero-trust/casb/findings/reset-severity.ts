/** @generated from zero-trust.casb.findings.reset-severity */
export default {
	method: "POST",
	path: "/accounts/{account_id}/data-security/posture/findings/{finding_id}/reset_finding_severity",
	errors: {
		400: "BadRequestError",
		404: "NotFoundError",
		500: "InternalServerError",
	},
} as const;
