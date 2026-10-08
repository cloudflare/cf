/** @generated from abuse-reports.emails.list */
export default {
	method: "GET",
	path: "/accounts/{account_id}/abuse-reports/{report_id}/emails",
	query: ["page", "per_page"],
	errors: {
		400: "BadRequestError",
		401: "UnauthorizedError",
		403: "ForbiddenError",
		500: "InternalServerError",
	},
} as const;
