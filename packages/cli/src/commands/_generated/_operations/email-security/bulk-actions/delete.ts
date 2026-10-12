/** @generated from email_security_delete_bulk_job */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/email-security/investigate/bulk/${request.job_id}`,
} as const;
