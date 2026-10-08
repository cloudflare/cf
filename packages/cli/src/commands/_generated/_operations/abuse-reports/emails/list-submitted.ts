/** @generated from abuse-reports.emails.list-submitted */
export default {
	method: "GET",
	path: "/accounts/{account_id}/abuse-reports/submitted/{report_id}/emails",
	query: ["page", "per_page"],
	errors: {
		400: "BadRequestError",
		401: "UnauthorizedError",
		403: "ForbiddenError",
		404: "NotFoundError",
		500: "InternalServerError",
	},
} as const;
