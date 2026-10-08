/** @generated from abuse-reports.get */
export default {
	method: "GET",
	path: "/accounts/{account_id}/abuse-reports/{report_param}",
	errors: {
		400: "BadRequestError",
		401: "UnauthorizedError",
		403: "ForbiddenError",
		500: "InternalServerError",
	},
} as const;
