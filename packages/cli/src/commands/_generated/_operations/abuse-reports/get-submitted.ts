/** @generated from abuse-reports.get-submitted */
export default {
	method: "GET",
	path: "/accounts/{account_id}/abuse-reports/submitted/{report_id}",
	errors: {
		400: "BadRequestError",
		401: "UnauthorizedError",
		403: "ForbiddenError",
		404: "NotFoundError",
		500: "InternalServerError",
	},
} as const;
