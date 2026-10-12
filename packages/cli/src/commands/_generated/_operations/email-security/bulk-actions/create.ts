/** @generated from email_security_create_bulk_job */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/email-security/investigate/bulk`,
	body: "json",
} as const;
