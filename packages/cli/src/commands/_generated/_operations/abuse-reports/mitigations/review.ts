/** @generated from abuse-reports.mitigations.review */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/abuse-reports/${request.report_id}/mitigations/appeal`,
	body: "json",
	errors: {
		401: "UnauthorizedError",
		403: "ForbiddenError",
		500: "InternalServerError",
	},
} as const;
