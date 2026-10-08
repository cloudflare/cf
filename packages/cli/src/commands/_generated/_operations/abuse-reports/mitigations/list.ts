/** @generated from abuse-reports.mitigations.list */
export default {
	method: "GET",
	path: "/accounts/{account_id}/abuse-reports/{report_id}/mitigations",
	query: [
		"page",
		"per_page",
		"sort",
		"type",
		"effective_before",
		"effective_after",
		"status",
		"entity_type",
	],
	errors: {
		401: "UnauthorizedError",
		403: "ForbiddenError",
		500: "InternalServerError",
	},
} as const;
