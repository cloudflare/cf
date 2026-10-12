/** @generated from ListAbuseReports */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/abuse-reports`,
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
