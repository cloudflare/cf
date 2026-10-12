/** @generated from reporting.reports.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/reporting/reports/${request.report_id}`,
	errors: {
		404: "NotFoundError",
	},
} as const;
