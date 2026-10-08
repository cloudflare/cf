/** @generated from abuse-reports.list */
export default {
	method: "GET",
	path: "/accounts/{account_id}/abuse-reports",
	query: [
		"page",
		"per_page",
		"sort",
		"search",
		"domain",
		"created_before",
		"created_after",
		"status",
		"type",
		"mitigation_status",
	],
	errors: {
		400: "BadRequestError",
		401: "UnauthorizedError",
		403: "ForbiddenError",
		500: "InternalServerError",
	},
} as const;
