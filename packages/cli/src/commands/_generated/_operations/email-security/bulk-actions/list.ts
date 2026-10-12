/** @generated from email_security_get_bulk_jobs */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/email-security/investigate/bulk`,
	query: ["page", "per_page", "action_type", "status"],
} as const;
