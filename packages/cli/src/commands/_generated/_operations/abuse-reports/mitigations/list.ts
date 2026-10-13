/** @generated from abuse-reports.mitigations.list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/abuse-reports/${request.report_id}/mitigations`,
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
