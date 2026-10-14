/** @generated from abuse-reports.appeals.eligibility */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/abuse-reports/${request.report_id}/appeals/eligibility`,
	errors: {
		401: "UnauthorizedError",
		403: "ForbiddenError",
		404: "NotFoundError",
		500: "InternalServerError",
	},
} as const;
