/** @generated from email_security_get_monthly_report */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/email-security/analytics/monthly_report`,
} as const;
