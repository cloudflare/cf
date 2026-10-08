/** @generated from zero-trust.casb.findings.tune-severity */
export default {
	method: "POST",
	path: "/accounts/{account_id}/data-security/posture/findings/{finding_id}/tune_finding_severity",
	body: "json",
	errors: {
		400: "BadRequestError",
		404: "NotFoundError",
		500: "InternalServerError",
	},
} as const;
