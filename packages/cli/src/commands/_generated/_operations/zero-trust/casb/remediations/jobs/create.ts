/** @generated from zero-trust.casb.remediations.jobs.create */
export default {
	method: "POST",
	path: "/accounts/{account_id}/data-security/posture/remediations/jobs",
	body: "json",
	errors: {
		400: "BadRequestError",
		409: "ConflictError",
	},
} as const;
