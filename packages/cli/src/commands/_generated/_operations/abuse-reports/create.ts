/** @generated from abuse-reports.create */
export default {
	method: "POST",
	path: "/accounts/{account_id}/abuse-reports/{report_param}",
	body: "json",
	errors: {
		400: "BadRequestError",
		401: "UnauthorizedError",
		403: "ForbiddenError",
		500: "InternalServerError",
	},
} as const;
