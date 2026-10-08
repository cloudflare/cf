/** @generated from abuse-reports.appeals.eligibility */
export default {
	method: "GET",
	path: "/accounts/{account_id}/abuse-reports/{report_id}/appeals/eligibility",
	errors: {
		401: "UnauthorizedError",
		403: "ForbiddenError",
		404: "NotFoundError",
		500: "InternalServerError",
	},
} as const;
