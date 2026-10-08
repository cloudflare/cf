/** @generated from abuse-reports.list-submitted */
export default {
	method: "GET",
	path: "/accounts/{account_id}/abuse-reports/submitted",
	query: [
		"page",
		"per_page",
		"sort",
		"id",
		"domain",
		"created_before",
		"created_after",
		"status",
		"type",
	],
	errors: {
		400: "BadRequestError",
		401: "UnauthorizedError",
		403: "ForbiddenError",
		500: "InternalServerError",
	},
} as const;
