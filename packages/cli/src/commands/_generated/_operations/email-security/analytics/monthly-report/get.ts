/** @generated from email-security.analytics.monthly-report.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/email-security/analytics/monthly_report`,
} as const;
