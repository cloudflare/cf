/** @generated from abuse-reports.mitigations.review */
export default {
	method: "POST",
	path: "/accounts/{account_id}/abuse-reports/{report_id}/mitigations/appeal",
	body: "json",
	errors: {
		401: "UnauthorizedError",
		403: "ForbiddenError",
		500: "InternalServerError",
	},
} as const;
