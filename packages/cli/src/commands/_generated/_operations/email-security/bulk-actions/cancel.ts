/** @generated from email_security_cancel_bulk_job */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/email-security/investigate/bulk/${request.job_id}/cancel`,
} as const;
